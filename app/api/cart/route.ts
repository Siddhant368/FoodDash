import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";

import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/guards";

import Cart from "@/models/Cart";
import Restaurant from "@/models/Restaurant";
import MenuItem from "@/models/MenuItem";

// ======================================================
// TYPES
// ======================================================

type CartItemData = {
  menuItemId: mongoose.Types.ObjectId;
  quantity: number;
};

type CartResponseItem = {
  menuItemId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  subtotal: number;
  isAvailable: boolean;
};

// ======================================================
// VALIDATION SCHEMAS
// ======================================================

const restaurantIdSchema = z.string().min(1);

const addCartSchema = z.object({
  restaurantId: z.string().min(1),
  menuItemId: z.string().min(1),
  quantity: z.number().int().min(1).max(50),
});

const updateCartSchema = z.object({
  restaurantId: z.string().min(1),
  menuItemId: z.string().min(1),
  quantity: z.number().int().min(1).max(50),
});

// ======================================================
// HELPERS
// ======================================================

function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

// ======================================================
// GET CART
//
// GET /api/cart?restaurantId=RESTAURANT_ID
// ======================================================

export async function GET(request: Request) {
  try {
    // --------------------------------------------------
    // 1. CUSTOMER AUTHENTICATION
    // --------------------------------------------------

    const user = await requireRole(["CUSTOMER"]);

    // --------------------------------------------------
    // 2. DATABASE
    // --------------------------------------------------

    await connectDB();

    // --------------------------------------------------
    // 3. GET RESTAURANT ID
    // --------------------------------------------------

    const { searchParams } = new URL(request.url);

    const restaurantId =
      searchParams.get("restaurantId");

    // --------------------------------------------------
    // 4. FIND CUSTOMER CART
    // --------------------------------------------------

    let cart;
    if (restaurantId) {
      if (!isValidObjectId(restaurantId)) {
        return NextResponse.json({ success: false, message: "Invalid restaurantId" }, { status: 400 });
      }
      cart = await Cart.findOne({
        customerId: user.id,
        restaurantId: restaurantId,
      }).lean();
    } else {
      // Find the most recent cart if no restaurantId provided
      cart = await Cart.findOne({
        customerId: user.id,
      }).sort({ updatedAt: -1 }).lean();
    }

    // --------------------------------------------------
    // 6. CART DOES NOT EXIST
    // --------------------------------------------------

    if (!cart) {
      return NextResponse.json({
        success: true,

        cart: null,

        summary: {
          subtotal: 0,
          deliveryFee: 0,
          tax: 0,
          discount: 0,
          total: 0,
          currency: "INR",
        },
      });
    }

    // --------------------------------------------------
    // 7. GET MENU ITEM IDS
    // --------------------------------------------------

    const menuItemIds = cart.items.map(
      (item: CartItemData) => item.menuItemId
    );

    // --------------------------------------------------
    // 8. FETCH MENU ITEMS
    //
    // Restaurant ID is included for tenant isolation.
    // --------------------------------------------------

    const menuItems = await MenuItem.find({
      _id: {
        $in: menuItemIds,
      },

      restaurantId: cart.restaurantId,
    })
      .select(
        "_id name price image isAvailable isVeg description"
      )
      .lean();

    // --------------------------------------------------
    // 9. CREATE MENU MAP
    // --------------------------------------------------

    const menuMap = new Map<
      string,
      {
        _id: mongoose.Types.ObjectId;
        name: string;
        price: number;
        image?: string;
        isAvailable: boolean;
        isVeg: boolean;
        description?: string;
      }
    >();

    menuItems.forEach((item) => {
      menuMap.set(
        item._id.toString(),
        item
      );
    });

    // --------------------------------------------------
    // 10. BUILD RESPONSE ITEMS
    // --------------------------------------------------

    const items: CartResponseItem[] = [];

    for (
      const cartItem of cart.items as CartItemData[]
    ) {
      const menuItem = menuMap.get(
        cartItem.menuItemId.toString()
      );

      // Menu item was deleted
      if (!menuItem) {
        continue;
      }

      const subtotal =
        menuItem.price *
        cartItem.quantity;

      items.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        image: menuItem.image,
        quantity: cartItem.quantity,
        subtotal,
        isAvailable:
          menuItem.isAvailable,
        isVeg: menuItem.isVeg,
        description: menuItem.description,
      } as any);
    }

    // --------------------------------------------------
    // 11. CALCULATE SUBTOTAL
    // --------------------------------------------------

    const subtotal = items.reduce(
      (total, item) =>
        total + item.subtotal,
      0
    );

    // --------------------------------------------------
    // 14. DISCOUNT
    // --------------------------------------------------

    let discountAmount = 0;
    let appliedCouponCode = cart.appliedCouponCode;
    let appliedOfferId = cart.appliedOfferId;
    let isFreeDelivery = false;
    let appliedOffer = null;

    if (cart.appliedCouponCode) {
      try {
        const { OfferService } = await import("@/lib/services/offer.service");
        const { discountAmount: calcDiscount, offer } = await OfferService.validateCoupon(
          cart.appliedCouponCode,
          cart.restaurantId.toString(),
          user.id,
          cart.items
        );
        discountAmount = calcDiscount;
        if (offer.discountType === "FREE_DELIVERY") {
          isFreeDelivery = true;
        }
        
        appliedOffer = {
          title: offer.title,
          code: offer.code,
          discountType: offer.discountType,
          discountValue: offer.discountValue,
          maxDiscount: offer.maxDiscount,
          minOrderAmount: offer.minOrderAmount
        };
      } catch (error) {
        console.warn("Coupon invalid, removing from cart", error);
        appliedCouponCode = undefined;
        appliedOfferId = undefined;
        appliedOffer = null;
        
        const { default: CartModel } = await import("@/models/Cart");
        await CartModel.updateOne(
          { _id: cart._id },
          { $unset: { appliedCouponCode: 1, appliedOfferId: 1 } }
        );
      }
    }

    const discount = discountAmount;

    // --------------------------------------------------
    // 13. TAX
    // --------------------------------------------------

    const tax =
      Math.round(subtotal * 0.05);

    // --------------------------------------------------
    // 12. DELIVERY FEE
    // --------------------------------------------------

    const deliveryFee = isFreeDelivery ? 0 : 40;

    // --------------------------------------------------
    // 15. TOTAL
    // --------------------------------------------------

    const total =
      subtotal +
      deliveryFee +
      tax -
      discount;

    // --------------------------------------------------
    // 15.5. FETCH RESTAURANT DETAILS
    // --------------------------------------------------
    const restaurant = await Restaurant.findById(cart.restaurantId).select("name address isOpen").lean();

    // --------------------------------------------------
    // 16. RESPONSE
    // --------------------------------------------------

    return NextResponse.json({
      success: true,

      cart: {
        id: cart._id,
        restaurantId:
          cart.restaurantId,
        restaurant,
        items,
        appliedCouponCode,
        appliedOfferId,
        appliedOffer,
      },

      summary: {
        subtotal,
        deliveryFee,
        tax,
        discount,
        total,
        currency: "INR",
      },
    });
  } catch (error: unknown) {
    console.error(
      "GET CART ERROR:",
      error
    );

    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Customer access required",
        },
        {
          status: 403,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch cart",
      },
      {
        status: 500,
      }
    );
  }
}

// ======================================================
// ADD ITEM TO CART
//
// POST /api/cart
// ======================================================

const addCartSchemaExtended = addCartSchema.extend({
  clearCart: z.boolean().optional(),
});

export async function POST(
  request: Request
) {
  try {
    // --------------------------------------------------
    // 1. CUSTOMER AUTHENTICATION
    // --------------------------------------------------

    const user = await requireRole([
      "CUSTOMER",
    ]);

    // --------------------------------------------------
    // 2. DATABASE
    // --------------------------------------------------

    await connectDB();

    // --------------------------------------------------
    // 3. REQUEST BODY
    // --------------------------------------------------

    const body: unknown =
      await request.json();

    // --------------------------------------------------
    // 4. VALIDATE BODY
    // --------------------------------------------------

    const parsed =
      addCartSchemaExtended.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid request data",
          errors:
            parsed.error.flatten(),
        },
        {
          status: 400,
        }
      );
    }

    const {
      restaurantId,
      menuItemId,
      quantity,
      clearCart,
    } = parsed.data;

    // --------------------------------------------------
    // 5. VALIDATE OBJECT IDS
    // --------------------------------------------------

    if (
      !isValidObjectId(
        restaurantId
      ) ||
      !isValidObjectId(
        menuItemId
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid restaurantId or menuItemId",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // MULTI-RESTAURANT PROTECTION
    // --------------------------------------------------
    
    const existingCarts = await Cart.find({ customerId: user.id });
    const differentCart = existingCarts.find(c => c.restaurantId.toString() !== restaurantId);

    if (differentCart) {
      if (clearCart) {
        // Clear all previous carts
        await Cart.deleteMany({ customerId: user.id, restaurantId: { $ne: restaurantId } });
      } else {
        return NextResponse.json(
          {
            success: false,
            code: "DIFFERENT_RESTAURANT",
            message: "Your cart contains items from another restaurant. Do you want to clear it and add this item?",
          },
          { status: 400 }
        );
      }
    }

    // --------------------------------------------------
    // 6. CHECK RESTAURANT
    // --------------------------------------------------

    const restaurant =
      await Restaurant.findOne({
        _id: restaurantId,
        isActive: true,
        isOpen: true,
      })
        .select("_id")
        .lean();

    if (!restaurant) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Restaurant is not available",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // 7. CHECK MENU ITEM
    // --------------------------------------------------

    const menuItem =
      await MenuItem.findOne({
        _id: menuItemId,
        restaurantId,
        isAvailable: true,
      })
        .select(
          "_id name price image isAvailable"
        )
        .lean();

    if (!menuItem) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Menu item is not available",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // 8. FIND CUSTOMER CART
    // --------------------------------------------------

    let cart =
      await Cart.findOne({
        customerId: user.id,
        restaurantId,
      });

    // ==================================================
    // CREATE NEW CART
    // ==================================================

    if (!cart) {
      cart = await Cart.create({
        customerId:
          new mongoose.Types.ObjectId(
            user.id
          ),

        restaurantId:
          new mongoose.Types.ObjectId(
            restaurantId
          ),

        items: [
          {
            menuItemId:
              new mongoose.Types.ObjectId(
                menuItemId
              ),

            quantity,
          },
        ],
      });
    }

    // ==================================================
    // UPDATE EXISTING CART
    // ==================================================

    else {
      const existingItem =
        cart.items.find(
          (item) =>
            item.menuItemId.toString() ===
            menuItemId
        );

      // ------------------------------------------------
      // ITEM ALREADY EXISTS
      // ------------------------------------------------

      if (existingItem) {
        const newQuantity =
          existingItem.quantity +
          quantity;

        if (newQuantity > 50) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Maximum quantity allowed is 50",
            },
            {
              status: 400,
            }
          );
        }

        existingItem.quantity =
          newQuantity;
      }

      // ------------------------------------------------
      // NEW ITEM
      // ------------------------------------------------

      else {
        cart.items.push({
          menuItemId:
            new mongoose.Types.ObjectId(
              menuItemId
            ),
          quantity,
        });
      }

      await cart.save();
    }

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return NextResponse.json({
      success: true,

      message:
        "Item added to cart",

      cart: {
        id: cart._id,
        restaurantId:
          cart.restaurantId,
        items: cart.items,
      },
    });
  } catch (error: unknown) {
    console.error(
      "ADD CART ERROR:",
      error
    );

    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Customer access required",
        },
        {
          status: 403,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to add item to cart",
      },
      {
        status: 500,
      }
    );
  }
}

// ======================================================
// UPDATE ITEM QUANTITY
//
// PATCH /api/cart
//
// Body:
// {
//   "restaurantId": "...",
//   "menuItemId": "...",
//   "quantity": 3
// }
// ======================================================

export async function PATCH(
  request: Request
) {
  try {
    // --------------------------------------------------
    // 1. CUSTOMER AUTHENTICATION
    // --------------------------------------------------

    const user = await requireRole([
      "CUSTOMER",
    ]);

    // --------------------------------------------------
    // 2. DATABASE
    // --------------------------------------------------

    await connectDB();

    // --------------------------------------------------
    // 3. REQUEST BODY
    // --------------------------------------------------

    const body: unknown =
      await request.json();

    // --------------------------------------------------
    // 4. VALIDATE BODY
    // --------------------------------------------------

    const parsed =
      updateCartSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid request data",
          errors:
            parsed.error.flatten(),
        },
        {
          status: 400,
        }
      );
    }

    const {
      restaurantId,
      menuItemId,
      quantity,
    } = parsed.data;

    // --------------------------------------------------
    // 5. VALIDATE OBJECT IDS
    // --------------------------------------------------

    if (
      !isValidObjectId(
        restaurantId
      ) ||
      !isValidObjectId(
        menuItemId
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid restaurantId or menuItemId",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // 6. FIND CUSTOMER CART
    // --------------------------------------------------

    const cart =
      await Cart.findOne({
        customerId: user.id,
        restaurantId,
      });

    if (!cart) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cart not found",
        },
        {
          status: 404,
        }
      );
    }

    // --------------------------------------------------
    // 7. FIND CART ITEM
    // --------------------------------------------------

    const item =
      cart.items.find(
        (cartItem) =>
          cartItem.menuItemId.toString() ===
          menuItemId
      );

    if (!item) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Item not found in cart",
        },
        {
          status: 404,
        }
      );
    }

    // --------------------------------------------------
    // 8. VERIFY MENU ITEM
    // --------------------------------------------------

    const menuItem =
      await MenuItem.findOne({
        _id: menuItemId,

        restaurantId:
          cart.restaurantId,

        isAvailable: true,
      })
        .select("_id")
        .lean();

    if (!menuItem) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Menu item is no longer available",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // 9. UPDATE QUANTITY
    // --------------------------------------------------

    item.quantity = quantity;

    // --------------------------------------------------
    // 10. SAVE
    // --------------------------------------------------

    await cart.save();

    // --------------------------------------------------
    // 11. RESPONSE
    // --------------------------------------------------

    return NextResponse.json({
      success: true,

      message:
        "Cart quantity updated",

      cart: {
        id: cart._id,

        restaurantId:
          cart.restaurantId,

        items: cart.items,
      },
    });
  } catch (error: unknown) {
    console.error(
      "UPDATE CART ERROR:",
      error
    );

    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Customer access required",
        },
        {
          status: 403,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update cart",
      },
      {
        status: 500,
      }
    );
  }
}

// ======================================================
// DELETE
//
// Clear entire cart:
//
// DELETE /api/cart?restaurantId=xxx
//
// Remove one item:
//
// DELETE /api/cart?restaurantId=xxx&menuItemId=xxx
// ======================================================

export async function DELETE(
  request: Request
) {
  try {
    // --------------------------------------------------
    // 1. CUSTOMER AUTHENTICATION
    // --------------------------------------------------

    const user = await requireRole([
      "CUSTOMER",
    ]);

    // --------------------------------------------------
    // 2. DATABASE
    // --------------------------------------------------

    await connectDB();

    // --------------------------------------------------
    // 3. QUERY PARAMETERS
    // --------------------------------------------------

    const { searchParams } =
      new URL(request.url);

    const restaurantId =
      searchParams.get(
        "restaurantId"
      );

    const menuItemId =
      searchParams.get(
        "menuItemId"
      );

    // --------------------------------------------------
    // 4. RESTAURANT ID REQUIRED
    // --------------------------------------------------

    const parsedRestaurant =
      restaurantIdSchema.safeParse(
        restaurantId
      );

    if (!parsedRestaurant.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            "restaurantId is required",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !isValidObjectId(
        parsedRestaurant.data
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid restaurantId",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // 5. FIND CUSTOMER CART
    // --------------------------------------------------

    const cart =
      await Cart.findOne({
        customerId: user.id,

        restaurantId:
          parsedRestaurant.data,
      });

    if (!cart) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cart not found",
        },
        {
          status: 404,
        }
      );
    }

    // ==================================================
    // CLEAR COMPLETE CART
    // ==================================================

    if (!menuItemId) {
      cart.items = [];

      await cart.save();

      return NextResponse.json({
        success: true,

        message:
          "Cart cleared successfully",

        cart: {
          id: cart._id,

          restaurantId:
            cart.restaurantId,

          items: cart.items,
        },
      });
    }

    // ==================================================
    // REMOVE SINGLE ITEM
    // ==================================================

    if (
      !isValidObjectId(
        menuItemId
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid menuItemId",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // CHECK ITEM EXISTS
    // --------------------------------------------------

    const itemExists =
      cart.items.some(
        (item) =>
          item.menuItemId.toString() ===
          menuItemId
      );

    if (!itemExists) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Item not found in cart",
        },
        {
          status: 404,
        }
      );
    }

    // --------------------------------------------------
    // REMOVE ITEM
    // --------------------------------------------------

    cart.items =
      cart.items.filter(
        (item) =>
          item.menuItemId.toString() !==
          menuItemId
      );

    // --------------------------------------------------
    // SAVE
    // --------------------------------------------------

    await cart.save();

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return NextResponse.json({
      success: true,

      message:
        "Item removed from cart",

      cart: {
        id: cart._id,

        restaurantId:
          cart.restaurantId,

        items: cart.items,
      },
    });
  } catch (error: unknown) {
    console.error(
      "DELETE CART ERROR:",
      error
    );

    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Customer access required",
        },
        {
          status: 403,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update cart",
      },
      {
        status: 500,
      }
    );
  }
}