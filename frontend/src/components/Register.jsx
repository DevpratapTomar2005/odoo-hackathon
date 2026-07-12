import { useForm } from "react-hook-form";
import { useNavigate,Link } from "react-router";
import { useRegister } from "../hooks/useAuth.js";
import { useDispatch } from 'react-redux';
import { setUser } from '../slices/authSlice.js';

const ROLES = [
  { label: "Fleet Manager", value: "fleet_manager" },
  { label: "Driver", value: "driver" },
  { label: "Safety Officer", value: "safety_officer" },
  { label: "Financial Officer", value: "financial_officer" },
  { label: "Trip Dispatcher", value: "trip_dispatcher" },
];

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { mutateAsync: registerUser, isPending, error: apiError } = useRegister();

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, getValues } = useForm({
    defaultValues: { name: "", email: "", password: "", role: "driver" },
  });

  const onSubmit = async (data) => {
    try {
      const response = await registerUser({ data });
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
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Create your account</h2>
        </div>

        {apiError && <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">{apiError.message}</div>}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input disabled={loading} {...register("name", { required: "Required" })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
              {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input disabled={loading} {...register("email", { required: "Required" })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
              {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select disabled={loading} {...register("role")} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2">
                {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input type="password" disabled={loading} {...register("password", { required: "Required" })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input type="password" disabled={loading} {...register("confirmPassword", { validate: (v) => v === getValues("password") || "Match error" })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
              {errors.confirmPassword && <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <div>Already have account? <Link to="/"><span className="font-semibold underline">Login</span></Link></div>

          <button type="submit" disabled={loading} className="w-full flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-white">
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}