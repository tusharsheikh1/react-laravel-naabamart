import FrontendLayout from '@/Layouts/Frontend/Layout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ auth }) {
    return (
        <FrontendLayout>
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Header Section: Title + Sign Out Button */}
                <div className="flex justify-between items-end">
                    <h2 className="text-3xl font-black uppercase tracking-tight text-black">
                        My Dashboard
                    </h2>
                    
                    {/* Logout Action */}
                    <Link 
                        href={route('logout')} 
                        method="post" 
                        as="button" 
                        className="bg-gray-200 hover:bg-gray-300 text-black px-6 py-2 rounded-full text-sm font-medium transition"
                    >
                        Sign Out
                    </Link>
                </div>

                {/* Main Content Card */}
                <div className="w-full overflow-hidden bg-white border border-gray-200 rounded-[20px] p-6 md:p-8">
                    <div className="text-gray-900">
                        <p className="text-xl font-bold mb-2">Hello, {auth.user.name} 👋</p>
                        <p className="text-gray-500 leading-relaxed max-w-2xl mb-8">
                            From your account dashboard you can view your <span className="font-medium text-black cursor-pointer underline">recent orders</span>, 
                            manage your <span className="font-medium text-black cursor-pointer underline">shipping addresses</span>, 
                            and <span className="font-medium text-black cursor-pointer underline">edit your password</span>.
                        </p>
                        
                        {/* Dashboard Quick Stats (Placeholder Data) */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-6 bg-[#F0F0F0] rounded-xl flex flex-col justify-center">
                                <h3 className="font-black text-2xl mb-1">0</h3>
                                <p className="text-sm text-gray-500 font-medium">Total Orders</p>
                            </div>
                            <div className="p-6 bg-[#F0F0F0] rounded-xl flex flex-col justify-center">
                                <h3 className="font-black text-2xl mb-1 text-yellow-600">0</h3>
                                <p className="text-sm text-gray-500 font-medium">Pending Delivery</p>
                            </div>
                            <div className="p-6 bg-[#F0F0F0] rounded-xl flex flex-col justify-center">
                                <h3 className="font-black text-2xl mb-1 text-red-500">2</h3>
                                <p className="text-sm text-gray-500 font-medium">Wishlist Items</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FrontendLayout>
    );
}