function TermsModal({ onAccept }: { onAccept: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white max-w-lg p-6 rounded-xl space-y-4">
        <h3 className="text-xl font-bold">Terms & Conditions</h3>

        <div className="text-sm text-gray-600 max-h-64 overflow-y-auto">
          • Milzull is a peer-to-peer platform  
          • We do not guarantee safety  
          • Users meet at their own risk  
          • False reports are punishable  
          • Location sharing is optional  
          • Identity verification improves trust  
          • Abuse leads to permanent ban  
        </div>

        <button
          onClick={onAccept}
          className="w-full bg-blue-600 text-white py-3 rounded-xl"
        >
          I Agree & Continue
        </button>
      </div>
    </div>
  );
}
