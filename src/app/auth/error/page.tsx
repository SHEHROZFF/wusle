export default function ErrorPage({ searchParams }: any) {
  const { error } = searchParams || {};

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded shadow text-center">
        <h2 className="text-2xl font-bold mb-4">Oops, Something Went Wrong</h2>
        <p className="mb-4">{error || "Unknown Error"}</p>
        <a href="/" className="text-blue-500 underline">Go Back Home</a>
      </div>
    </div>
  );
}
