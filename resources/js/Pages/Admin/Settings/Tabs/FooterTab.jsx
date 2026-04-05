import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

export default function FooterTab({ data, setData }) {
    return (
        <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <InputLabel htmlFor="newsletter_title" value="Newsletter Title" />
                    <TextInput
                        id="newsletter_title"
                        className="mt-1 block w-full"
                        value={data.newsletter_title}
                        onChange={(e) => setData('newsletter_title', e.target.value)}
                        placeholder="e.g., Stay in the loop"
                    />
                </div>
                <div>
                    <InputLabel htmlFor="copyright_text" value="Bottom Copyright Text" />
                    <TextInput
                        id="copyright_text"
                        className="mt-1 block w-full"
                        value={data.copyright_text}
                        onChange={(e) => setData('copyright_text', e.target.value)}
                        placeholder="e.g., All Rights Reserved"
                    />
                </div>
            </div>
            <div>
                <InputLabel htmlFor="newsletter_subtitle" value="Newsletter Subtitle" />
                <textarea
                    id="newsletter_subtitle"
                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                    rows="2"
                    value={data.newsletter_subtitle}
                    onChange={(e) => setData('newsletter_subtitle', e.target.value)}
                    placeholder="e.g., Get updates on new authentic arrivals..."
                />
            </div>
            <div>
                <InputLabel htmlFor="site_description" value="Footer Site Description (Below Logo)" />
                <textarea
                    id="site_description"
                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                    rows="3"
                    value={data.site_description}
                    onChange={(e) => setData('site_description', e.target.value)}
                    placeholder="e.g., 100% authentic dates, premium ghee..."
                />
            </div>
        </div>
    );
}