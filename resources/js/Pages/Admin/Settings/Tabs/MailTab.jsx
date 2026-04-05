import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

export default function CourierTab({ data, setData }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 bg-yellow-50 text-yellow-800 p-4 rounded-md">
                Updating these settings will override the hardcoded API keys in your .env file.
            </div>

            {/* Steadfast Setup */}
            <div className="md:col-span-2 border-b pb-4 mb-2">
                <h3 className="text-lg font-medium text-gray-900">Steadfast Courier Credentials</h3>
            </div>
            <div className="md:col-span-2">
                <InputLabel htmlFor="courier_steadfast_base_url" value="Steadfast Base URL" />
                <TextInput
                    id="courier_steadfast_base_url"
                    className="mt-1 block w-full"
                    value={data.courier_steadfast_base_url}
                    onChange={(e) => setData('courier_steadfast_base_url', e.target.value)}
                    placeholder="https://portal.packzy.com/api/v1"
                />
            </div>
            <div>
                <InputLabel htmlFor="courier_steadfast_api_key" value="Steadfast API Key" />
                <TextInput
                    id="courier_steadfast_api_key"
                    className="mt-1 block w-full"
                    value={data.courier_steadfast_api_key}
                    onChange={(e) => setData('courier_steadfast_api_key', e.target.value)}
                />
            </div>
            <div>
                <InputLabel htmlFor="courier_steadfast_secret_key" value="Steadfast Secret Key" />
                <TextInput
                    id="courier_steadfast_secret_key"
                    type="password"
                    className="mt-1 block w-full"
                    value={data.courier_steadfast_secret_key}
                    onChange={(e) => setData('courier_steadfast_secret_key', e.target.value)}
                />
            </div>

            {/* BDCourier Setup */}
            <div className="md:col-span-2 border-b pb-4 mt-6 mb-2">
                <h3 className="text-lg font-medium text-gray-900">BDCourier API</h3>
            </div>
            <div className="md:col-span-2">
                <InputLabel htmlFor="courier_bdcourier_api_key" value="BDCourier API Key" />
                <TextInput
                    id="courier_bdcourier_api_key"
                    type="password"
                    className="mt-1 block w-full"
                    value={data.courier_bdcourier_api_key}
                    onChange={(e) => setData('courier_bdcourier_api_key', e.target.value)}
                />
            </div>
        </div>
    );
}