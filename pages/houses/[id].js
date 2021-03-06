import Head from "next/head";
import Layout from "../../components/Layout";
import DateRangePicker from "../../components/DateRangePicker";
import { useStoreActions, useStoreState } from "easy-peasy";
import Router from "next/router";
import React, { useState } from "react";
import fetch from "isomorphic-unfetch";
import axios from "axios";

const calcNumberOfNightsBetweenDates = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let dayCount = 0;

  while (end > start) {
    dayCount++;
    start.setDate(start.getDate() + 1);
  }

  return dayCount;
};

const canBook = async (houseId, startDate, endDate, userEmail) => {
  try {
    const token = window.sessionStorage.getItem("token");

    const response = await axios({
      method: "post",
      url: "https://polar-refuge-69571.herokuapp.com/api/house/check",
      data: {
        houseId,
        startDate,
        endDate,
        userEmail,
      },
      headers: {
        "content-type": "application/json",
        authorization: token,
      },
    });
    console.log("response", response);
    if (response.data.message === "busy") {
      alert(response.data.message);
      return;
    }

    return true;
  } catch (error) {
    console.log(error);
    return;
  }
};
const getBookedDates = async (id) => {
  try {
    const response = await axios.post(
      "https://polar-refuge-69571.herokuapp.com/api/house/booked",
      {
        houseId: id,
      }
    );

    if (response.data.status === "error") {
      alert(response.data.message);
      return;
    }
    return response.data.dates;
  } catch (error) {
    console.log(error);
  }
};

const House = (props) => {
  const [dateChosen, setDateChosen] = useState(false);
  const [numberOfNightsBetweenDates, setNumberOfNightsBetweenDates] = useState(
    0
  );
  const setShowLoginModal = useStoreActions(
    (actions) => actions.modals.setShowLoginModal
  );
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const user = useStoreState((state) => state.user.user);

  const content = (
    <div className="container">
      <Head>
        <title>{props.house.title}</title>
      </Head>
      <article>
        <img
          src={props.house.picture}
          alt={props.house.title}
          width="100%"
          alt="House picture"
        />
        <p>
          {props.house.type} - {props.house.town}
        </p>
        <div
          dangerouslySetInnerHTML={{
            __html: props.house.description,
          }}
        ></div>
        <div>
          {props.house.rating}{" "}
          {props.house.reviewsCount ? (
            <div className="reviews">
              <h3>{props.house.reviewsCount} Reviews</h3>

              {props.house.reviews.map((review, index) => {
                return (
                  <div key={index}>
                    <p>{new Date(review.createdAt).toDateString()}</p>
                    <p>{review.comment}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <></>
          )}
        </div>
      </article>
      <aside>
        <h2>Add dates for prices</h2>
        <DateRangePicker
          datesChange={(startDate, endDate) => {
            setNumberOfNightsBetweenDates(
              calcNumberOfNightsBetweenDates(startDate, endDate)
            );
            setDateChosen(true);
            setStartDate(startDate);
            setEndDate(endDate);
          }}
          bookedDates={props.responseDate}
        />
        {dateChosen && (
          <div>
            <h2>Price per night</h2>
            <p>${props.house.price}</p>
            <h2>Total Price for booking</h2>
            <p>
              ${(numberOfNightsBetweenDates * props.house.price).toFixed(2)}
            </p>
            {user ? (
              <button
                className="reserve"
                onClick={async () => {
                  if (
                    !(await canBook(props.house.id, startDate, endDate, user))
                  ) {
                    alert("The date choosen are not valid");
                    return;
                  }
                  try {
                    const token = window.sessionStorage.getItem("token");
                    const response = await axios({
                      method: "post",
                      url:
                        "https://polar-refuge-69571.herokuapp.com/api/house/reserve",
                      data: {
                        houseId: props.house.id,
                        startDate,
                        endDate,
                        reserved: true,
                        user,
                      },
                      headers: {
                        "content-type": "application/json",
                        authorization: token,
                      },
                    });

                    if (response.data.status === "error") {
                      alert(response.data.message);
                      return;
                    }

                    alert("Booking Successfull");
                    Router.push("/bookings");
                    return;
                  } catch (error) {
                    console.error(error);
                  }
                }}
              >
                Reserve
              </button>
            ) : (
              <button
                className="reserve"
                onClick={() => {
                  setShowLoginModal();
                }}
              >
                Reserve
              </button>
            )}
          </div>
        )}
      </aside>

      <style jsx>{`
        .container {
          display: grid;
          grid-template-columns: 60% 40%;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          grid-gap: 30px;
        }

        aside {
          border: 1px solid #ccc;
          padding: 20px;
        }
        button {
          background-color: rgb(255, 90, 95);
          color: white;
          font-size: 13px;
          width: 100%;
          border: none;
          height: 40px;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
  return <Layout content={content} />;
};

House.getInitialProps = async ({ query }) => {
  const { id } = query;

  const res = await fetch(
    `https://polar-refuge-69571.herokuapp.com/api/house/${id}`
  );
  const house = await res.json();
  const responseDate = await getBookedDates(id);

  return {
    house,
    responseDate,
  };
};

export default House;
