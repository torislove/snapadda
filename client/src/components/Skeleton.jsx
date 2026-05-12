import { motion } from 'framer-motion';

export const Skeleton = ({ className, style }) => (
  <div
    className={`animate-pulse rounded-md bg-white/5 ${className}`}
    style={{
      ...style,
      backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 100%)',
      backgroundSize: '200% 100%',
    }}
  />
);

export const PropertySkeleton = () => (
  <div className="glass-panel overflow-hidden rounded-3xl border border-white/5">
    <div className="aspect-[4/3] w-full bg-white/5" />
    <div className="space-y-3 p-4">
      <Skeleton className="h-6 w-3/4" />
      <div className="flex gap-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-8 w-1/3" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  </div>
);
