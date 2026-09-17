import { MessageSquare } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-[#111111] tracking-tight">Messages</h1>
        <p className="text-gray-500 font-medium mt-1">Communicate with customers and delivery partners.</p>
      </div>
      
      <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm">
        <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-bold text-[#111111] mb-2">No new messages</h3>
        <p className="text-gray-500 max-w-sm mx-auto">You're all caught up! Customer inquiries and chat logs will appear here.</p>
      </div>
    </div>
  );
}
