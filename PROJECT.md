# **Circulab Project**

## **Summary**

This is aweb project for a map of agroecological resources.  
The map has a series of pins corresponding to the location of those resources.
These can be places where agroecology workshops are held, compostable resources, materials that can be used to build objects or infrastructure, etc.

There are three levels of categorization for each pin: Typology > Category > Characteristics

Each pin includes information such as images, address, coordinates, title, notes, etc.

## **Technology**

* Astro, with Vue or Svelte. Astro actions for requests.  
* Web Awesome for components  
* Supabase for the database.  
* Leaflet or MapLibre GL for the map  
* It will be a PWA

## **Users**

There will be a users table.

Users can have 3 roles:

* **user**: Can add pins and suggest edits (can self-register)  
* **moderator**: Can accept new pins or edits (invited by admins)  
* **admin**: Can manage moderators or block users

## **User registration**

### **New user**

Use Supabase OTP (One-Time Password)

1. Person opens the map  
2. Clicks the “Add” button  
3. A form appears asking for email  
4. On submit  
   1. The form switches to a code input  
   2. An email is sent with the code  
5. The person goes to their email and enters the code in the form  
6. That email is registered in the users db with role “user”. A token should be stored so they do not have to repeat the process.

### **Existing user**

1. Same as “New user”  
2. At step 6, instead of adding a new user, refresh the token

## **Addition flow**

1. After registration, when clicking the “Add” button, the user is redirected to the addition “Wizard”  
2. In the first step, there is a series of checkboxes to confirm that the new place makes sense. They can only continue if all are checked  
3. In the second step, Typology is chosen, Category (according to the selected Typology), and Characteristics (optional, but tied to the Category)  
4. In step 3, location is entered. It can be linked to an already created place.

## **Map**

* Pins cluster into a “bubble” if they are very close  
* There must be visual differentiation between pins of different Typologies/Categories  
* There will be filtering by Typology/Category

## **Database**

* users  
  * email  
  * token  
  * active: bool  
  * blocked: bool  
  * accepted\_pins: number  
* roles  
  * description  
  * slug  
* typologies  
  * description  
* categories  
  * **typology**  
  * description  
* characteristics  
  * **categories\[\]**  
  * description  
* locations  
  * name  
  * address  
  * postal\_code  
  * location  
  * coordinates (postGIS)  
  * email (optional)  
  * phone (optional)  
  * **networks\[\]** (optional)  
* networks (website, instagram, facebook, etc)  
  * name  
  * slug  
* pins  
  * title  
  * description  
  * images\[\] (Supabase Storage)  
  * **location**  
  * coordinates (more specific than location) (postGIS)  
  * created\_by  
  * accepted\_by  
  * created\_date  
  * updated\_date  
  * updated\_by  
  * **category**  
  * **characteristics\[\]**
