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