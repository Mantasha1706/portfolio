import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-50 text-center">
      <main className="flex w-full flex-col items-center justify-center px-4 sm:px-20">
        <h1 className="bg-gradient-to-r from-orange-600 to-yellow-500 bg-clip-text text-6xl font-black text-transparent sm:text-8xl">
          MakerFest
        </h1>
        <p className="mt-4 text-2xl font-medium text-gray-700 sm:text-3xl">
          Student Portfolio & Poster Generator
        </p>
        <p className="mt-4 max-w-2xl text-lg text-gray-600">
          Document your Design Thinking journey, showcase your solar energy projects, and create professional posters in minutes.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/login"
            className="rounded-full bg-orange-600 px-8 py-4 text-xl font-bold text-white shadow-lg transition-all hover:bg-orange-500 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-300"
          >
            Student / Teacher Login
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 text-left md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-md transition-shadow hover:shadow-xl">
            <div className="mb-4 text-4xl">🚀</div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">Showcase Projects</h3>
            <p className="text-gray-600">Upload descriptions, photos, and details about your innovative solar projects.</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-md transition-shadow hover:shadow-xl">
            <div className="mb-4 text-4xl">🎨</div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">Create Posters</h3>
            <p className="text-gray-600">Use our smart editor to generate beautiful, exhibition-ready posters automatically.</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-md transition-shadow hover:shadow-xl">
            <div className="mb-4 text-4xl">👨‍🏫</div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">Teacher Dashboard</h3>
            <p className="text-gray-600">Teachers can review, approve, and manage project submissions from their class.</p>
          </div>
        </div>
      </main>

      <footer className="absolute bottom-4 text-sm text-gray-500">
        © {new Date().getFullYear()} MakerFest Portfolio. All rights reserved.
      </footer>
    </div>
  );
}
