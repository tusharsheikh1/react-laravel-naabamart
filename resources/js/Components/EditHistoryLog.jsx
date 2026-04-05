export default function EditHistoryLog({ history, formatDateTime }) {
    if (!history || history.length === 0) return null;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Edit History Log
            </h2>
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {[...history].reverse().map((log, i) => (
                    <div key={i} className="flex gap-3 text-sm">
                        <div className="flex flex-col items-center">
                            <div className="w-2.5 h-2.5 bg-gray-300 rounded-full mt-1.5"></div>
                            {i !== history.length - 1 && <div className="w-px h-full bg-gray-200 my-1"></div>}
                        </div>
                        <div className="pb-3">
                            <p className="font-bold text-gray-800">{log.action}</p>
                            <p className="text-xs text-gray-500">
                                by <span className="font-semibold text-indigo-600">{log.user}</span> on {formatDateTime(log.time)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}