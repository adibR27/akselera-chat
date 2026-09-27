import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Akselera Chat
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Silakan login untuk melanjutkan
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}