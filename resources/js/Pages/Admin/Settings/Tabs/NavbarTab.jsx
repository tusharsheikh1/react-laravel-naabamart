import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

export default function NavbarTab({ data, setData }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <InputLabel htmlFor="top_banner_text" value="Top Banner Notification Text" />
                <TextInput
                    id="top_banner_text"
                    className="mt-1 block w-full"
                    value={data.top_banner_text}
                    onChange={(e) => setData('top_banner_text', e.target.value)}
                    placeholder="e.g., Free delivery over ৳4000"
                />
            </div>
            <div>
                <InputLabel htmlFor="top_banner_link_text" value="Top Banner Link Text" />
                <TextInput
                    id="top_banner_link_text"
                    className="mt-1 block w-full"
                    value={data.top_banner_link_text}
                    onChange={(e) => setData('top_banner_link_text', e.target.value)}
                    placeholder="e.g., Shop Now"
                />
            </div>
            <div className="md:col-span-2">
                <InputLabel htmlFor="search_placeholder" value="Search Bar Placeholder" />
                <TextInput
                    id="search_placeholder"
                    className="mt-1 block w-full md:w-1/2"
                    value={data.search_placeholder}
                    onChange={(e) => setData('search_placeholder', e.target.value)}
                    placeholder="e.g., Search dates, ghee, honey..."
                />
            </div>
        </div>
    );
}