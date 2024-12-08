import { cloneElement, useEffect, useRef } from "react";

interface InfiniteLoaderProps<T> {
  items: T[];
  stopLoading: boolean;
  totalItems: number;
  currentItems: number;
  defaultQuantity: number;
  renderSkeletonMethod: (quantity: number) => Array<JSX.Element | null>;
  renderItem: (item: T) => JSX.Element | null;
  onLoadMorePosts: () => void;
}

function InfiniteLoader<T extends object>({
  items,
  stopLoading,
  totalItems,
  currentItems,
  defaultQuantity,
  renderSkeletonMethod,
  renderItem,
  onLoadMorePosts,
}: InfiniteLoaderProps<T>) {
  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useRef();
  const skeletonItems = renderSkeletonMethod(Math.min(Math.abs(totalItems - currentItems), defaultQuantity));
  const FirstSkeleton = skeletonItems[0];
  const restSkeletonItems = skeletonItems.slice(1);

  const handleObserver = entries => {
    const target = entries[0];
    if (target.isIntersecting) {
      onLoadMorePosts();
    }
  };

  useEffect(() => {
    if (!lastItemRef.current || stopLoading) {
      return;
    }

    observer.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "0px",
      threshold: 1.0,
    });

    if (observer.current) {
      observer.current.observe(lastItemRef.current);
    }

    return () => {
      observer.current?.disconnect();
    };
  }, [lastItemRef]);

  return (
    <>
      {items.map(renderItem)}
      {stopLoading ? null : (
        <>
          {FirstSkeleton && cloneElement(FirstSkeleton, { ref: lastItemRef })}

          {restSkeletonItems}
        </>
      )}
    </>
  );
}

export default InfiniteLoader;
