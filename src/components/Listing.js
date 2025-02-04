import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Link, useParams } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";

import { BACKEND_URL } from "../constants.js";

const Listing = () => {
  const [listingId, setListingId] = useState();
  const [listing, setListing] = useState({});

  const { isAuthenticated, getAccessTokenSilently, loginWithRedirect, user } =
    useAuth0();

  useEffect(() => {
    // If there is a listingId, retrieve the listing data
    if (listingId) {
      axios.get(`${BACKEND_URL}/listings/${listingId}`).then((response) => {
        setListing(response.data);
      });
    }
    // Only run this effect on change to listingId
  }, [listingId]);

  // Update listing ID in state if needed to trigger data retrieval
  const params = useParams();
  if (listingId !== params.listingId) {
    setListingId(params.listingId);
  }

  // Store a new JSX element for each property in listing details
  const listingDetails = [];
  if (listing) {
    for (const key in listing) {
      listingDetails.push(
        <Card.Text key={key}>{`${key}: ${listing[key]}`}</Card.Text>
      );
    }
  }

  // const handleClick = () => {
  //   axios.put(`${BACKEND_URL}/listings/${listingId}`).then((response) => {
  //     setListing(response.data);
  //   });
  // };

  const handleClick = async () => {
    // If user is not yet authenticated, authenticate before allowing them to buy
    if (!isAuthenticated) {
      loginWithRedirect();
      return;
    }

    // Retrieve access token
    const accessToken = await getAccessTokenSilently({
      authorizationParams: {
        audience: `https://carousell/api`,
        scope: "read:current_user",
      },
      // audience: "https://carousell/api",
      // scope: "read:current_user",
    });

    // Mark the listing as bought
    const response = await axios.put(
      `${BACKEND_URL}/listings/${listingId}/buy`,
      // User is currently logged-in user
      { buyerEmail: user.email },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // Update the listing on the page
    setListing(response.data);
  };

  return (
    <div>
      <Link to="/">Home</Link>
      <Card bg="dark">
        <Card.Body>
          {listingDetails}
          <Button onClick={handleClick} disabled={listing.buyerId}>
            Buy
          </Button>
        </Card.Body>
      </Card>
      <br />
    </div>
  );
};

export default Listing;
