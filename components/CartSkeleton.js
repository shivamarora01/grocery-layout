import { TailSpin } from 'react-loader-spinner';

export default function SkeletonLoader() {
    return (      
          <div className="flex justify-center items-center h-screen">
      <div className="animate-fast-spin">
        <TailSpin
          height="80"
          width="80"
          color="#333"
          ariaLabel="tail-spin-loading"
          radius="1"
          visible={true}
        />
      </div>
    </div>

    );
}
