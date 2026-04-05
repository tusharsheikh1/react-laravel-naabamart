import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import Checkbox from '@/Components/Checkbox';

function SmsTemplateCard({ id, label, enabledKey, templateKey, data, setData, variables }) {
    return (
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <div className="flex items-center justify-between mb-2">
                <InputLabel htmlFor={id} value={label} className="font-bold text-gray-700" />
                <label className="flex items-center cursor-pointer">
                    <Checkbox
                        checked={data[enabledKey]}
                        onChange={(e) => setData(enabledKey, e.target.checked)}
                    />
                    <span className="ml-2 text-sm text-gray-600 font-medium">Enable</span>
                </label>
            </div>
            <textarea
                id={id}
                className={`mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm ${!data[enabledKey] ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                rows="3"
                value={data[templateKey]}
                onChange={(e) => setData(templateKey, e.target.value)}
                disabled={!data[enabledKey]}
            />
            <p className="text-[11px] text-gray-500 mt-2">
                Variables:{' '}
                {variables.map((v) => (
                    <code key={v} className="bg-gray-200 px-1 rounded mr-1">{v}</code>
                ))}
            </p>
        </div>
    );
}

export default function SmsTab({ data, setData }) {
    return (
        <div className="space-y-8">
            <div className="bg-blue-50 text-blue-800 p-4 rounded-md">
                Configure your BulkSMSBD credentials and manage notifications below. Toggle the switch to easily turn specific messages on or off.
            </div>

            {/* API Configuration */}
            <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">API Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <InputLabel htmlFor="sms_bulksmsbd_url" value="API Base URL" />
                        <TextInput
                            id="sms_bulksmsbd_url"
                            className="mt-1 block w-full bg-gray-50"
                            value={data.sms_bulksmsbd_url}
                            onChange={(e) => setData('sms_bulksmsbd_url', e.target.value)}
                            placeholder="http://bulksmsbd.net/api"
                        />
                    </div>
                    <div>
                        <InputLabel htmlFor="sms_bulksmsbd_api_key" value="API Key" />
                        <TextInput
                            id="sms_bulksmsbd_api_key"
                            type="password"
                            className="mt-1 block w-full"
                            value={data.sms_bulksmsbd_api_key}
                            onChange={(e) => setData('sms_bulksmsbd_api_key', e.target.value)}
                        />
                    </div>
                    <div>
                        <InputLabel htmlFor="sms_bulksmsbd_sender_id" value="Sender ID" />
                        <TextInput
                            id="sms_bulksmsbd_sender_id"
                            className="mt-1 block w-full"
                            value={data.sms_bulksmsbd_sender_id}
                            onChange={(e) => setData('sms_bulksmsbd_sender_id', e.target.value)}
                            placeholder="8809617618255"
                        />
                    </div>
                </div>
            </div>

            {/* SMS Templates */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Manage Automated Messages</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SmsTemplateCard
                        id="sms_template_order_placed"
                        label="Order Placed (Confirmation)"
                        enabledKey="sms_notify_order_placed"
                        templateKey="sms_template_order_placed"
                        data={data}
                        setData={setData}
                        variables={['{name}', '{order_number}', '{amount}']}
                    />
                    <SmsTemplateCard
                        id="sms_template_order_shipped"
                        label="Order Shipped"
                        enabledKey="sms_notify_order_shipped"
                        templateKey="sms_template_order_shipped"
                        data={data}
                        setData={setData}
                        variables={['{name}', '{order_number}']}
                    />
                    <SmsTemplateCard
                        id="sms_template_order_delivered"
                        label="Order Delivered"
                        enabledKey="sms_notify_order_delivered"
                        templateKey="sms_template_order_delivered"
                        data={data}
                        setData={setData}
                        variables={['{name}', '{order_number}']}
                    />
                    <SmsTemplateCard
                        id="sms_template_order_cancelled"
                        label="Order Cancelled"
                        enabledKey="sms_notify_order_cancelled"
                        templateKey="sms_template_order_cancelled"
                        data={data}
                        setData={setData}
                        variables={['{name}', '{order_number}']}
                    />
                    <div className="md:col-span-2">
                        <SmsTemplateCard
                            id="sms_template_order_dispatched"
                            label="Courier Dispatch (Steadfast Tracking)"
                            enabledKey="sms_notify_order_dispatched"
                            templateKey="sms_template_order_dispatched"
                            data={data}
                            setData={setData}
                            variables={['{name}', '{order_number}', '{tracking_code}']}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}