# Users

## User roles

There is an users table in the database.
Users can have the following roles:
* **contributor**: Can add resources and suggest edits. Can self-register.
* **moderator**: Can accept new resources or edits. Invited by admins.
* **admin**: Can manage moderators or block users.

## Contributors
Contributors register using Supabase OTP (One-Time Password)

### New contributor

1. User opens the map  
2. Clicks the “Add” button  
3. A form appears asking for email  
4. On submit  
   1. The form switches to a code input  
   2. An email is sent with the code  
5. The user goes to their email and enters the code in the form  
6. That email is registered in the users db with role “contributor”. A token should be stored so they do not have to repeat the process.

### Existing contributor

1. Same as “New contributor”  
2. At step 6, instead of adding a new user, refresh the token
