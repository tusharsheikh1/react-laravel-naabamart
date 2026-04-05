import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

export default function SeoTab({ data, setData, settings }) {
    return (
        <div className="grid grid-cols-1 gap-6">
            <div>
                <InputLabel htmlFor="seo_meta_title" value="Default Meta Title" />
                <TextInput
                    id="seo_meta_title"
                    className="mt-1 block w-full"
                    value={data.seo_meta_title}
                    onChange={(e) => setData('seo_meta_title', e.target.value)}
                />
            </div>
            <div>
                <InputLabel htmlFor="seo_homepage_title" value="Homepage SEO Tagline" />
                <TextInput
                    id="seo_homepage_title"
                    className="mt-1 block w-full"
                    value={data.seo_homepage_title}
                    onChange={(e) => setData('seo_homepage_title', e.target.value)}
                    placeholder="e.g. Authentic Dates, Raw Honey & Premium Groceries"
                />
                <p className="text-xs text-gray-500 mt-1">This appears on your homepage before the brand name.</p>
            </div>
            <div>
                <InputLabel htmlFor="seo_meta_description" value="Default Meta Description" />
                <textarea
                    id="seo_meta_description"
                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                    rows="3"
                    value={data.seo_meta_description}
                    onChange={(e) => setData('seo_meta_description', e.target.value)}
                />
            </div>
            <div>
                <InputLabel htmlFor="seo_meta_keywords" value="Meta Keywords (Comma Separated)" />
                <TextInput
                    id="seo_meta_keywords"
                    className="mt-1 block w-full"
                    value={data.seo_meta_keywords}
                    onChange={(e) => setData('seo_meta_keywords', e.target.value)}
                />
            </div>
            <div>
                <InputLabel htmlFor="seo_meta_image" value="Default Social Sharing Image (Meta Image)" />
                {settings.seo_meta_image && (
                    <div className="mb-2">
                        <img
                            src={`/storage/${settings.seo_meta_image}`}
                            alt="Default Meta"
                            className="h-32 w-auto object-cover rounded border"
                        />
                    </div>
                )}
                <input
                    type="file"
                    id="seo_meta_image"
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    onChange={(e) => setData('seo_meta_image', e.target.files[0])}
                />
                <p className="text-xs text-gray-500 mt-1">Recommended size: 1200x630px. This image appears when your site is shared on Facebook, Twitter, etc.</p>
            </div>
        </div>
    );
}