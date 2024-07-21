

const SuccessMessage = () => {
  return (
    
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="card">
          <div className="rounded-full h-24 w-24 bg-cream flex justify-center items-center mx-auto mb-6">
            <i className="checkmark text-green-700 text-6xl ml-[-15px]  transition  animate-ping ">✓</i>
          </div>
          <h1 className="text-green-700 font-semibold text-4xl mb-2">Success</h1>
          <p className="text-green-700 font-medium text-lg">We received your purchase request<br /> we&apos;ll be in touch shortly!</p>
        </div>
      </div>
  );
};

export default SuccessMessage;
