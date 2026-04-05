import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

export default function SocialTab({ data, setData }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <InputLabel htmlFor="social_facebook" value="Facebook URL" />
                <TextInput id="social_facebook" className="mt-1 block w-full" value={data.social_facebook} onChange={(e) => setData('social_facebook', e.target.value)} />
            </div>
            <div>
                <InputLabel htmlFor="social_twitter" value="Twitter URL" />
                <TextInput id="social_twitter" className="mt-1 block w-full" value={data.social_twitter} onChange={(e) => setData('social_twitter', e.target.value)} />
            </div>
            <div>
                <InputLabel htmlFor="social_instagram" value="Instagram URL" />
                <TextInput id="social_instagram" className="mt-1 block w-full" value={data.social_instagram} onChange={(e) => setData('social_instagram', e.target.value)} />
            </div>
            <div>
                <InputLabel htmlFor="social_linkedin" value="LinkedIn URL" />
                <TextInput id="social_linkedin" className="mt-1 block w-full" value={data.social_linkedin} onChange={(e) => setData('social_linkedin', e.target.value)} />
            </div>
        </div>
    );
}