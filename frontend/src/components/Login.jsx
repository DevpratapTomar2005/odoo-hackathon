import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router";
import { useLogin } from "../hooks/useAuth.js";
import { useDispatch } from 'react-redux';
import { setUser } from '../slices/authSlice.js';


export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { mutateAsync: login, isPending, error: apiError } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: { email: "", password: "", role: "driver" },
  });

  const onSubmit = async (data) => {
    try {
      const response = await login({ data });
      dispatch(setUser(response.data.user));
      reset();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error(err);
    }
  };

  const loading = isSubmitting || isPending;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Login to your account</h2>
          <p className="mt-2 text-sm text-gray-600">Enter your credentials to access the dashboard</p>
        </div>

        {apiError && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
            {apiError.message}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                id="email"
                type="email"
                disabled={loading}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100 sm:text-sm"
                {...register("email", {
                  required: "Email address is required",
                  pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email" },
                })}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                type="password"
                disabled={loading}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100 sm:text-sm"
                {...register("password", { required: "Password is required", minLength: { value: 8, message: "Min 8 characters" } })}
              />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>
          </div>
          <div>Dont have account? <Link to="/register"><span className="font-semibold underline">Register</span></Link></div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}