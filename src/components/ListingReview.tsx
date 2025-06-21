import React from 'react';
import { Circle } from 'lucide-react';

interface ListingReviewProps {
  listing: {
    title:       string;
    description: string;
    price:       string | number;  // allow number or string
    category:    string;
  };
  onAccept: () => void;
  onReject:  () => void;
}

const ListingReview: React.FC<ListingReviewProps> = ({ listing, onAccept, onReject }) => {
  // format price as GBP currency
  const formattedPrice = new Intl.NumberFormat('en-GB', {
    style:    'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(typeof listing.price === 'string' ? parseFloat(listing.price) : listing.price);

  return (
    <div className="w-full">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Circle className="w-6 h-6 text-green-600 fill-current" />
        </div>
        <h3 className="text-2xl font-light text-stone-900 mb-4">Listing ready</h3>
        <p className="text-stone-600 font-light">Review your generated listing</p>
      </div>

      <div className="bg-stone-50 border border-stone-200 rounded-lg p-8 mb-8">
        <div className="space-y-6">
          <div>
            <label className="text-sm text-stone-500 font-light block mb-2">Title</label>
            <p className="text-stone-800 font-light bg-white border border-stone-200 p-4 rounded">
              {listing.title}
            </p>
          </div>
          
          <div>
            <label className="text-sm text-stone-500 font-light block mb-2">Category</label>
            <p className="text-stone-600 bg-white border border-stone-200 p-4 rounded font-light">
              {listing.category}
            </p>
          </div>
          
          <div>
            <label className="text-sm text-stone-500 font-light block mb-2">Starting price</label>
            <p className="text-stone-800 text-xl font-light bg-white border border-stone-200 p-4 rounded">
              {formattedPrice}
            </p>
          </div>

          <div>
            <label className="text-sm text-stone-500 font-light block mb-2">Description</label>
            <div className="bg-white border border-stone-200 p-4 rounded h-32 overflow-y-auto">
              <p className="text-stone-800 font-light whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onReject}
          className="flex-1 border border-stone-300 text-stone-600 hover:bg-stone-50 px-6 py-3 rounded-md font-light transition-colors"
        >
          Provide feedback
        </button>

        <button
          onClick={onAccept}
          className="flex-1 bg-stone-800 hover:bg-stone-900 text-stone-50 px-6 py-3 rounded-md font-light transition-colors"
        >
          Upload to eBay
        </button>
      </div>

      <p className="text-center text-stone-500 text-sm mt-4 font-light">
        Your listing will be published once accepted
      </p>
    </div>
  );
};

export default ListingReview;
