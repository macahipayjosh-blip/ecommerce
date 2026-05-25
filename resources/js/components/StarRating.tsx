import { Star } from 'lucide-react';

interface Props {
    rating: number;
    count?: number;
    size?: 'sm' | 'md';
}

export default function StarRating({ rating: rawRating, count, size = 'sm' }: Props) {
    const rating = Number(rawRating) || 0;
    const sz = size === 'md' ? 'h-4 w-4' : 'h-3 w-3';

    return (
        <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`${sz} ${
                            rating >= star
                                ? 'fill-yellow-400 text-yellow-400'
                                : rating >= star - 0.5
                                ? 'fill-yellow-200 text-yellow-400'
                                : 'fill-gray-200 text-gray-300'
                        }`}
                    />
                ))}
            </div>
            {count !== undefined && (
                <span className="text-xs text-gray-400">
                    {rating > 0 ? rating.toFixed(1) : 'No ratings'}
                    {count > 0 && ` (${count})`}
                </span>
            )}
        </div>
    );
}
