import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

export default function FloatingTab({ data, setData }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 bg-green-50 text-green-800 p-4 rounded-md">
                Configure the floating contact widget options for your website. Leave a field blank to disable that specific option.
            </div>
            <div>
                <InputLabel htmlFor="floating_whatsapp" value="WhatsApp Number (include country code)" />
                <TextInput
                    id="floating_whatsapp"
                    className="mt-1 block w-full"
                    placeholder="e.g., 8801XXXXXXXXX"
                    value={data.floating_whatsapp}
                    onChange={(e) => setData('floating_whatsapp', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Do not include + or spaces.</p>
            </div>
            <div>
                <InputLabel htmlFor="floating_messenger" value="Messenger Link" />
                <TextInput
                    id="floating_messenger"
                    className="mt-1 block w-full"
                    placeholder="e.g., https://m.me/yourpage"
                    value={data.floating_messenger}
                    onChange={(e) => setData('floating_messenger', e.target.value)}
                />
            </div>
            <div>
                <InputLabel htmlFor="floating_phone" value="Phone Number (for direct calling)" />
                <TextInput
                    id="floating_phone"
                    className="mt-1 block w-full"
                    placeholder="e.g., +8801XXXXXXXXX"
                    value={data.floating_phone}
                    onChange={(e) => setData('floating_phone', e.target.value)}
                />
            </div>
        </div>
    );
}