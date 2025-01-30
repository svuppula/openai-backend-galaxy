import React from 'react'

const App = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI API Service</h1>
      <p>
        API documentation available at{' '}
        <a 
          href="/api-docs" 
          className="text-blue-500 hover:text-blue-700 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          /api-docs
        </a>
      </p>
    </div>
  )
}

export default App