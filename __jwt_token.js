// Install jwt
// jwt.sign(payload, secret, {expiresIn:})
// token client


// //how to store token in client side
// 1.memory --> ok type
// 2.local storage --> ok type(xss)
// 3.cookie --> http only-> ok type(xss) ->better then local storage and memory


// 1.set cookies with http only for development secure : false,
// 2. cors => app.use(cors(
//   {
//     origin:['http://localhost:5173'],
//     credentials:true
//   }
// ));


// 3.client side axios setting =>
//  in axios => {withCredentials:true}

//to send cookies from the client make sure you added withCredentials: true in axios configeration.
//use cookie-parser as middleware

/**
 * 1.jwt --> json web token
 *2. generate a token by using jwt.sign()
 *3.create api set to cookie. http only , secure, samesite
 4. from client side: axios withcredentials true
 5. cors setup origin and credentials


 //1. for secure api calls
 2. install cookie parser and use it as a middleware
 3. req.cookies
 4. on the client make api call using axios withcredentials:true
 5.
 */