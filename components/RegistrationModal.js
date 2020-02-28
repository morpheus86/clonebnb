export default props => (
  <>
    <h2>Sign up</h2>
    <div>
      <form
        onSubmit={ev => {
          alert("Registration");
          ev.preventDefault();
        }}
      >
        <input id="email" type="email" placeholder="Email address" />
        <input id="password" type="password" placeholder="Password" />
        <input
          id="passwordconfirmation"
          type="password"
          placeholder="Enter password again"
        />
        <button>Sign up</button>
      </form>
      <p>
        Already have an account?{" "}
        <a href="#" onClick={() => props.showLogin()}>
          Log in
        </a>
      </p>
      <style jsx>
        {`
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

          input[type="text"],
          input[type="email"],
          input[type="password"] {
            display: block;
            padding: 20px;
            font-size: 20px !important;
            width: 100%;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-sizing: border-box;
            margin-bottom: 10px;
          }
        `}
      </style>
    </div>
  </>
);