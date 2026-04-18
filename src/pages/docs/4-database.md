# Database

## Tables
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
