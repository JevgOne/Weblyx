import { NextResponse } from 'next/server';

/**
 * Google Places API endpoint to fetch reviews
 * Requires GOOGLE_PLACES_API_KEY in .env
 */

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID || 'ChIJRXDG3wC5S0cRFZIz5-vFbHY';

  if (!apiKey) {
    console.error('Missing GOOGLE_PLACES_API_KEY');
    return NextResponse.json(
      { error: 'Google API key not configured' },
      { status: 500 }
    );
  }

  try {
    // Fetch place details including reviews
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews&key=${apiKey}&language=cs`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('Google Places API error:', data.status);
      return NextResponse.json(
        { error: 'Failed to fetch reviews', status: data.status },
        { status: 500 }
      );
    }

    const result = data.result;

    // Format reviews for our app
    const reviews = (result.reviews || []).map((review: any) => ({
      id: review.time.toString(),
      authorName: review.author_name,
      authorImage: review.profile_photo_url,
      rating: review.rating,
      text: review.text,
      date: new Date(review.time * 1000).toISOString(),
      source: 'Google',
      sourceUrl: review.author_url,
      relativeTime: review.relative_time_description,
    }));

    return NextResponse.json({
      success: true,
      data: {
        name: result.name,
        rating: result.rating,
        totalReviews: result.user_ratings_total,
        reviews,
      },
    });
  } catch (error) {
    console.error('Error fetching Google reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
