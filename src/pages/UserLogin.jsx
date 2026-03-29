import React from 'react';

const UserLogin = ({ onLogin, theme }) => {
  return (
    <div className={`min-h-screen flex items-center justify-center ${theme.bg} py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500`}>
      {/* 裝飾用的背景光暈 */}
      <div className={`absolute top-[-10%] right-[-10%] w-64 h-64 rounded-full ${theme.primary} blur-3xl opacity-10`}></div>

      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl z-10 animate-fade-in border border-gray-100">

        {/* 標題與 Slogan */}
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            CheckMate
          </h2>
          <p className="mt-3 text-sm text-gray-500 font-medium">
            Plan smarter, travel together.
          </p>
        </div>

        {/* 登入表單 */}
        <form className="mt-8 space-y-6" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Email Address</label>
              <input
                type="email"
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition duration-200 text-gray-600"
                placeholder="name@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Password</label>
              <input
                type="password"
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition duration-200 text-gray-600"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-slate-800 focus:ring-slate-800 border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 cursor-pointer">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-semibold text-slate-600 hover:text-slate-900 transition duration-150">
                Forgot password?
              </a>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all duration-200"
          >
            Sign In
          </button>
        </form>

        {/* 底部導引 */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Don't have an account?{' '}
            <a href="#" className="font-bold text-slate-900 hover:underline underline-offset-4">
              Create an account
            </a>
          </p>
        </div>

      </div>
    </div>
  );
};

export default UserLogin;