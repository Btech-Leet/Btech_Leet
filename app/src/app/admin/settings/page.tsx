import { Settings, Save } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings size={24} className="text-blue-500" />
          Platform Settings
        </h1>
        <p className="text-gray-400 text-sm mt-1">Configure global application preferences</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-medium text-white mb-4">General Settings</h2>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Platform Name</label>
            <input 
              type="text" 
              defaultValue="BTech LEET" 
              className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Contact Email</label>
            <input 
              type="email" 
              defaultValue="support@btechleet.com" 
              className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-800 rounded-xl bg-gray-950/50">
            <div>
              <p className="text-sm font-medium text-white">Maintenance Mode</p>
              <p className="text-xs text-gray-500 mt-0.5">Disable public access to the platform temporarily</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-800 rounded-xl bg-gray-950/50">
            <div>
              <p className="text-sm font-medium text-white">Enable User Registration</p>
              <p className="text-xs text-gray-500 mt-0.5">Allow new users to sign up via Email or Google</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-800 flex justify-end">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            <Save size={16} />
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
