 const express = require('express');
 const mongoose = require('mongoose');
 const bodyParser = require('body-parser');
 const prompt=require('prompt-sync')();
 const path=require('path');
const { StringDecoder } = require('string_decoder');
 const app = express();
 const port = 3000;
 let email_="";

 // Connect to your MongoDB instance (replace 'mongodb://localhost/mydatabase' with your MongoDB URL)
 mongoose.connect('mongodb://127.0.0.1:27017/jaithra', { useNewUrlParser: true, 
useUnifiedTopology: true });

 // Create a Mongoose model (schema) for payment
 const payment = mongoose.model('payment', {
    name: String,
    nick_name: String,
    email: String,
    gender: String,
    pay: String,
    card_num: String,
    cvc: String
 });
 
// Create a Mongoose model (schema) for cart itmes
const registrations = mongoose.model('registrations', {
  fname: String,
  lname: String,
  email: String,
  phone: Number,
  password: String,
});

 // Create a Mongoose model (schema) for payment
 const contact = mongoose.model('contact', {
  query: String,
  myName: String,
  myEmail: String,
  myPhone: Number,
  member: String,
  message: String
});

 // Middleware for parsing form data
 app.use(bodyParser.urlencoded({ extended: true }));

 app.use(express.static(path.join(__dirname, 'public')));
 
 // Serve the Sign-up form
 app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'/public/login.html'));
 });
 
 // Handle form submission
 app.post('/payment', (req, res) => {
 const { name, nick_name, email, gender, pay, card_num, cvc } = req.body;
 
 // Create a new User document and save it to MongoDB
 const user = new payment({ name, nick_name, email, gender, pay, card_num, cvc });
    user.save()
    .then(() => {
        
        const errorMessage = 'Payment Succesfully done!';
        return res.status(400).send(`
        <script>
            alert("${errorMessage}");
            window.location.href = "/index.html";
        </script>
        `);
 })

 .catch((err) => {
 console.error(err);
    res.status(500).send('Error While doing payment.');
 });
 });

 // submission o contatc details
 app.post('/contact', (req, res) => {
  const { query, myName, myEmail, myPhone, member, message } = req.body;
  
  // Create a new User document and save it to MongoDB
  const user = new contact({ query, myName, myEmail, myPhone, member, message });
     user.save()
     .then(() => {
         
         const errorMessage = 'Your contact details saved!';
         return res.status(400).send(`
         <script>
             alert("${errorMessage}");
             window.location.href = "/index.html";
         </script>
         `);
  })
 
  .catch((err) => {
  console.error(err);
     res.status(500).send('Error While doing payment.');
  });
  });
 
// submission of signup

// Handle form submission
app.post('/signup', (req, res) => {
  const { fname, lname, email, phone, password } = req.body;
  
  // Create a new User document and save it to MongoDB
  const user = new registrations({ fname, lname, email, phone, password });
     user.save()
     .then(() => {
         
         const errorMessage = 'Registartion done!';
         return res.status(400).send(`
         <script>
             alert("${errorMessage}");
             window.location.href = "/login.html";
         </script>
         `);
  })
 
  .catch((err) => {
  console.error(err);
     res.status(500).send('Error While doing payment.');
  });
  });
 


// Serve the login form

app.get('/login', (req, res) => {
    const { email, password } = req.query;
  
    // Check if the entered details exist in the database
    registrations.findOne({email, password }).exec()
    .then(data => {
      if (data) {
        const errorMessage = 'Login Succesfully! Enjoy';
        const name =  data.user_name;
        res.status(400).send(`
        <script>
            alert("${errorMessage}");
            window.location.href = "/index.html";
        </script>
        `);
        email_=email;

      } else {
        const errorMessage = 'INVALID LOGIN CREDENTIALS';
        res.status(400).send(`
        <script>
            alert("${errorMessage}");
            window.location.href = "/";
        </script>
        `);
      }
    })
    .catch(err => {
      console.error(err);
      const errorMessage = 'An error occurred while finding user.';
      res.status(400).send(`
        <script>
            alert("${errorMessage}");
            window.location.href = "/";
        </script>`)
    });
});


  app.get('/users', async (req, res) => {
  try {
      const users = await payment.find({}); // Find all users in the database

      // Check if there are users to display
      if (users.length > 0) {
          // Create an HTML table to display user information
          let table = '<table border="1px" align="center" size=10>';
          table += '<tr><th>Name</th><th>Email</th></tr>';

          users.forEach(user => {
              table += `<tr><td>${user.name}</td><td>${user.email}</td></tr>`;
          });

          table += '</table>';

          // Send the table as an HTML response
          res.send(table);
      } else {
          res.send('No users found.'); // Handle the case where there are no users to display
      }
  } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred while fetching users.');
  }
});

// updating value via browser
 app.get('/forgot', (req, res) => {
  try {
    const { email, newpassword } = req.query;
    // Find the user by username and update their email
    registrations.findOneAndUpdate(
      { email },
      { password: newpassword },
      { new: true }
    )
    .then(updatedUser => {
      if (updatedUser) {
        const errorMessage="Updated Succesfully !";
        res.status(400).send(`
        <script>
            alert("${errorMessage}");
            window.location.href = "/login.html";
        </script>`);
      } else {
        const errorMessage="INVALID DETAILS !";
        res.status(400).send(`
        <script>
            alert("${errorMessage}");
            window.location.href = "/";
        </script>`);
      }
    }).catch(err => {
      console.error(err);
      const errorMessage="An error occurred while updating user data.";
        res.status(400).send(`
        <script>
            alert("${errorMessage}");
            window.location.href = "/home.html";
        </script>`);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while updating user data.');
  }
});

  // deleting user via delete button
  app.get('/delete', async(req, res) => {
    const { email } = req.query;
    try {
      const result = await registrations.deleteOne({ email });
  
      if (result.deletedCount > 0) {
        console.log('User deleted successfully');
        const errorMessage="User deleted Succesfully !";
          res.status(400).send(`
          <script>
              alert("${errorMessage}");
              window.location.href = "/login.html";
          </script>`);
      } else {
        console.log('User not found');
        res.status(404).send('User not found');
      }
    } catch (err) {
      console.error('Error while deleting the record:', err);
      res.status(500).send('Error occurred while deleting the user');
    }
  });
  
// cart items storage
app.post('/buy', (req, res) => {
  const { user_name, size, color } = req.body;
  
  // Create a new User document and save it to MongoDB
  var data = {
    "name":name,
    "email":email_,
    "size":size,
    "product":product,
    "Address":address,

  }
  const user = new merchandise({ user_name, size, color });
     user.save()
     .then(() => {
         
         const errorMessage = 'Thank You buy again!';
         return res.status(400).send(`
         <script>
             alert("${errorMessage}");
             window.location.href = "/hoodies.html";
         </script>
         `);
  })
 
  .catch((err) => {
  console.error(err);
     res.status(500).send('Error While registering your account Please try agian.');
  });
  });
 

// cart items view


 // Start the server
 app.listen(port, () => {
 console.log(`Server is running on port ${port}`);
 });


/*
    9 - 18       -- moongose connection and schema
   25 - 52       -- inserting values (Sign up form)
   55 - 91       -- retrieving values (Login form)
   94 - 103      -- viewing all users
  105 - 144      -- updating using console
  146 - 165      -- deleting using console
  167 - 206      -- updating on browser(forgot password)
  208 - 231      -- deleting on browser
*/ 