import { Link } from 'react-router-dom'

export function Status404() {
  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="text-center">
        <h1 className="text-3xl font-semibold mb-2">404 Not Found</h1>
        <p className="text-neutral-600 mb-4">The page you are looking for could not be found.</p>
        <Link to="/" className="text-brand underline">Go back</Link>
      </div>
    </div>
  )
}

