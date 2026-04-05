import InputLabel from '@/Components/InputLabel';

function ScriptField({ id, label, value, onChange, placeholder }) {
    return (
        <div>
            <InputLabel htmlFor={id} value={label} />
            <textarea
                id={id}
                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm font-mono text-sm"
                rows="4"
                value={value || ''}
                onChange={onChange}
                placeholder={placeholder || '...'}
            />
        </div>
    );
}

function SelectField({ id, label, value, onChange, description }) {
    return (
        <div>
            <InputLabel htmlFor={id} value={label} />
            <select
                id={id}
                value={value ?? '1'} // Default to Enabled if undefined
                onChange={onChange}
                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
            >
                <option value="1">Enabled - Track Events</option>
                <option value="0">Disabled - Pause Tracking</option>
            </select>
            {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
        </div>
    );
}

export default function ScriptsTab({ data, setData }) {
    return (
        <div className="grid grid-cols-1 gap-6">
            <div className="bg-blue-50 text-blue-800 p-4 rounded-md text-sm">
                Manage your third-party tracking codes and master toggles here. Ensure you include the full <code>&lt;script&gt;</code> tags when required by the provider.
            </div>

            {/* --- Master Tracking Toggles --- */}
            <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl">
                <SelectField
                    id="enable_meta_tracking"
                    label="Meta (Facebook) Pixel & CAPI Master Switch"
                    value={data.enable_meta_tracking}
                    onChange={(e) => setData('enable_meta_tracking', e.target.value)}
                    description="Globally enables or disables all Meta Pixel and Server-Side API events."
                />
            </div>

            <hr className="border-gray-200" />
            
            <ScriptField
                id="script_meta_pixel"
                label="Meta (Facebook) Pixel Base Script"
                value={data.script_meta_pixel}
                onChange={(e) => setData('script_meta_pixel', e.target.value)}
                placeholder="Paste the base Meta Pixel code snippet here"
            />

            <ScriptField
                id="script_gtm_head"
                label="Google Tag Manager (Head)"
                value={data.script_gtm_head}
                onChange={(e) => setData('script_gtm_head', e.target.value)}
            />
            
            <ScriptField
                id="script_gtm_body"
                label="Google Tag Manager (Body)"
                value={data.script_gtm_body}
                onChange={(e) => setData('script_gtm_body', e.target.value)}
            />
            
            <ScriptField
                id="script_tiktok_pixel"
                label="TikTok Pixel"
                value={data.script_tiktok_pixel}
                onChange={(e) => setData('script_tiktok_pixel', e.target.value)}
            />
            
            <ScriptField
                id="script_custom_head"
                label="Other Custom Scripts (Head)"
                value={data.script_custom_head}
                onChange={(e) => setData('script_custom_head', e.target.value)}
                placeholder="Any additional tags, scripts, or meta verifications to load in the <head>"
            />
            
            <ScriptField
                id="script_custom_body"
                label="Other Custom Scripts (Body)"
                value={data.script_custom_body}
                onChange={(e) => setData('script_custom_body', e.target.value)}
                placeholder="Any additional scripts to load before the closing </body> tag"
            />
        </div>
    );
}