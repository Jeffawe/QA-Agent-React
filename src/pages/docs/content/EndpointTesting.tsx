
export const EndpointTesting = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-shrink-0 self-center sm:self-start">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Endpoint Testing Mode</h2>
          <p className="text-gray-600 leading-relaxed mb-4 text-sm sm:text-base">
            QA-Agent now allows users to not just test sites but API endpoints. Simply put the URL of an API endpoint (it has to use OpenAPI or Swagger so we can extract the docs from it) and then watch it run. Basic endpoint testing doesn't require an API Key (you may still need to provide one but it won't be used).
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-yellow-800 text-sm">
              💡 When using Endpoint Testing, please don't forget to set endpoint to true (if not it will use the normal analysis mode)
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-yellow-800 text-sm">
              💡 We are launching advanced mode soon that may need an API key and would add more features.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-2">Headers in Endpoint Testing</h3>
            <p className="text-gray-600 text-sm sm:text-base mb-3">
              In endpoint testing, headers are important. Use Data Items to add headers to your requests.
            </p>
            <p className="text-gray-600 text-sm sm:text-base">
              To add a header to the request we'll be making to test, simply do:
            </p>
            <div className="bg-white rounded border p-3 mt-2 font-mono text-sm">
              <div className="text-gray-700">
                <span className="font-semibold">Key:</span> header:api-key<br />
                <span className="font-semibold">Value:</span> your-api-key-value
              </div>
            </div>
            <p className="text-gray-500 text-xs sm:text-sm mt-2">
              The "header:" prefix and the ":" are important as that is how it'll know it's a header.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mt-5">
            <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-2">Configuration in Endpoint Testing</h3>
            <p className="text-gray-600 text-sm sm:text-base mb-3">
              In endpoint testing, you can also customize the query, header or body of the request per API endpoint.
            </p>
            <p className="text-gray-600 text-sm sm:text-base">
              To add a new configuration to the request we'll be making to test, simply do:
            </p>
            <div className="bg-white rounded border p-3 mt-2 font-mono text-sm">
              <div className="text-gray-700">
                <span className="font-semibold">Key:</span> endpoint:/create/user<br />
                <span className="font-semibold">Value:</span> {"{"}<br />
                &nbsp;&nbsp;"query": "POST",<br />
                &nbsp;&nbsp;"headers": {"{"} "api-key": "xxxxxxxxxxx" {"}"},<br />
                &nbsp;&nbsp;"body": {"{"} "name": "Test User", "email": "6T2eI@example.com" {"}"},<br />
                {"}"}
              </div>
            </div>
            <p className="text-gray-500 text-xs sm:text-sm mt-2">
              The "endpoint:" prefix and the ":" in the key are important as that is how it'll know it's a endpoint (it can parse it however but it's a good way to make sure).
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 mt-5">
            <p className="text-yellow-800 text-sm">
              💡 To see an example of a config file go to the <a>Examples</a> section
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};