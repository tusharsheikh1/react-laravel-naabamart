// resources/js/Pages/Admin/Settings/Tabs/GeneralTab.jsx
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

export default function GeneralTab({ data, setData, errors, settings }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* --- SITE THEME SETTING --- */}
            <div className="col-span-1 md:col-span-2 p-4 bg-gray-50 border rounded-lg">
                <InputLabel htmlFor="site_theme" value="Active Site Theme" className="text-lg font-bold text-indigo-700" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                        <select
                            id="site_theme"
                            className="block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                            value={data.site_theme || 'general'}
                            onChange={(e) => setData('site_theme', e.target.value)}
                        >
                            <option value="general">General Store (Default)</option>
                            <option value="book">Book Selling</option>
                            <option value="food">Food Selling</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">This will completely change the frontend Layout, Navbar, and Footer.</p>
                    </div>

                    {/* NEW: Color picker for the dynamic CSS theme color */}
                    <div>
                        <InputLabel htmlFor="primary_color" value="Primary Theme Color" className="text-sm font-semibold" />
                        <div className="flex items-center gap-2 mt-1">
                            <input
                                type="color"
                                id="primary_color"
                                className="h-10 w-14 rounded cursor-pointer border-gray-300 shadow-sm"
                                value={data.primary_color || '#2d5a27'}
                                onChange={(e) => setData('primary_color', e.target.value)}
                            />
                            <TextInput 
                                type="text"
                                className="block w-full" 
                                value={data.primary_color || '#2d5a27'} 
                                onChange={(e) => setData('primary_color', e.target.value)} 
                                placeholder="#2d5a27"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Controls the main color for buttons, lines, and accents on the frontend.</p>
                    </div>
                </div>
            </div>
            {/* ----------------------------------------- */}

            <div>
                <InputLabel htmlFor="site_language" value="Default Website Language" />
                <select
                    id="site_language"
                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                    value={data.site_language || 'en'}
                    onChange={(e) => setData('site_language', e.target.value)}
                >
                    <option value="en">English</option>
                    <option value="bn">Bangla</option>
                </select>
            </div>
            
            <div>
                <InputLabel htmlFor="general_product_layout" value="General Product Layout" />
                <select
                    id="general_product_layout"
                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                    value={data.general_product_layout || 'ShowGeneral'}
                    onChange={(e) => setData('general_product_layout', e.target.value)}
                >
                    <option value="ShowGeneral">Default (ShowGeneral)</option>
                    <option value="ShowFood">Food (ShowFood)</option>
                    <option value="ShowFashion">Fashion (ShowFashion)</option>
                    <option value="ShowGadget">Gadgets (ShowGadget)</option>
                </select>
            </div>

            <div>
                <InputLabel htmlFor="checkout_success_layout" value="Checkout Success Page Layout" />
                <select
                    id="checkout_success_layout"
                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                    value={data.checkout_success_layout || 'default'}
                    onChange={(e) => setData('checkout_success_layout', e.target.value)}
                >
                    <option value="default">Default (With AI Call Note)</option>
                    <option value="professional">Professional (Clean, No AI Note)</option>
                </select>
            </div>

            <div>
                <InputLabel htmlFor="site_name" value="Site Name" />
                <TextInput id="site_name" className="mt-1 block w-full" value={data.site_name || ''} onChange={(e) => setData('site_name', e.target.value)} />
                <InputError className="mt-2" message={errors.site_name} />
            </div>
            <div>
                <InputLabel htmlFor="site_email" value="Contact Email" />
                <TextInput id="site_email" type="email" className="mt-1 block w-full" value={data.site_email || ''} onChange={(e) => setData('site_email', e.target.value)} />
            </div>
            <div>
                <InputLabel htmlFor="site_phone" value="Contact Phone" />
                <TextInput id="site_phone" className="mt-1 block w-full" value={data.site_phone || ''} onChange={(e) => setData('site_phone', e.target.value)} />
            </div>
            <div>
                <InputLabel htmlFor="site_address" value="Physical Address" />
                <TextInput id="site_address" className="mt-1 block w-full" value={data.site_address || ''} onChange={(e) => setData('site_address', e.target.value)} />
            </div>
            <div>
                <InputLabel htmlFor="site_logo" value="Site Logo" />
                {settings.site_logo && (
                    <img src={`/storage/${settings.site_logo}`} alt="Logo" className="h-12 mb-2 object-contain" />
                )}
                <input
                    type="file"
                    id="site_logo"
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    onChange={(e) => setData('site_logo', e.target.files[0])}
                />
            </div>
            <div>
                <InputLabel htmlFor="site_favicon" value="Site Favicon" />
                {settings.site_favicon && (
                    <img src={`/storage/${settings.site_favicon}`} alt="Favicon" className="h-8 mb-2 object-contain" />
                )}
                <input
                    type="file"
                    id="site_favicon"
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    onChange={(e) => setData('site_favicon', e.target.files[0])}
                />
            </div>
        </div>
    );
}