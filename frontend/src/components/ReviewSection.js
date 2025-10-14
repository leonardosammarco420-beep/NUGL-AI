import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Star, ThumbsUp } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export default function ReviewSection({ itemId, itemType }) {
  const { user, token, API } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewData, setReviewData] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [itemId]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API}/reviews/${itemId}`);
      setReviews(response.data);
    } catch (error) {
      console.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !token) {
      toast.error('Please login to leave a review');
      return;
    }
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      await axios.post(
        `${API}/reviews`,
        {
          item_id: itemId,
          item_type: itemType,
          rating,
          ...reviewData
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Review submitted!');
      setShowForm(false);
      setRating(0);
      setReviewData({ title: '', content: '' });
      fetchReviews();
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  const StarRating = ({ value, interactive = false, size = 'md' }) => {
    const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${interactive ? 'cursor-pointer' : ''} ${
              star <= (interactive ? (hoverRating || rating) : value)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-600'
            }`}
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
          />
        ))}
      </div>
    );
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="mt-8" data-testid="review-section">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Reviews</h3>
          {reviews.length > 0 && (
            <div className="flex items-center gap-3">
              <StarRating value={parseFloat(averageRating)} />
              <span className="text-white font-semibold text-lg">{averageRating}</span>
              <span className="text-gray-400">({reviews.length} reviews)</span>
            </div>
          )}
        </div>
        {user && !showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-teal-500 hover:bg-teal-600"
            data-testid="write-review-button"
          >
            Write a Review
          </Button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <Card className="bg-slate-800/50 border-teal-500/20 p-6 mb-6" data-testid="review-form">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="text-white font-medium mb-2 block">Your Rating</label>
              <StarRating value={rating} interactive={true} />
            </div>
            <div className="mb-4">
              <label className="text-white font-medium mb-2 block">Review Title</label>
              <Input
                value={reviewData.title}
                onChange={(e) => setReviewData({ ...reviewData, title: e.target.value })}
                placeholder="Sum up your experience"
                className="bg-slate-700 border-slate-600 text-white"
                required
                data-testid="review-title-input"
              />
            </div>
            <div className="mb-4">
              <label className="text-white font-medium mb-2 block">Your Review</label>
              <Textarea
                value={reviewData.content}
                onChange={(e) => setReviewData({ ...reviewData, content: e.target.value })}
                placeholder="Share your thoughts about this..."
                className="bg-slate-700 border-slate-600 text-white min-h-[120px]"
                required
                data-testid="review-content-input"
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" className="bg-teal-500 hover:bg-teal-600" data-testid="submit-review">
                Submit Review
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="border-gray-600 text-gray-400"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <Card className="bg-slate-800/50 border-teal-500/20 p-8 text-center">
          <p className="text-gray-400">No reviews yet. Be the first to review!</p>
        </Card>
      ) : (
        <div className="space-y-4" data-testid="reviews-list">
          {reviews.map((review) => (
            <Card key={review.id} className="bg-slate-800/50 border-teal-500/20 p-6" data-testid={`review-${review.id}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-white font-semibold">{review.username}</span>
                    <StarRating value={review.rating} size="sm" />
                  </div>
                  <p className="text-gray-500 text-sm">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-teal-400"
                  data-testid={`helpful-${review.id}`}
                >
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  Helpful ({review.helpful_count})
                </Button>
              </div>
              <h4 className="text-white font-semibold mb-2">{review.title}</h4>
              <p className="text-gray-300">{review.content}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}