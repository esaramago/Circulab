# Circulab

## Project overview

### Summary
This is a web application with a map of agroecological resources.  
The map has a series of resources corresponding to the location of those resources: places where agroecology workshops are held, compostable resources, materials that can be used to build objects or infrastructure, etc.

### Map
* There is a visual differentiation between resources of different Typologies/Categories
* There are filtering by Typology/Category

### Resources
* Each resource includes information such as images, address, coordinates, title, notes, etc
* Resources cluster into a bubble if they are very close

### Categorization
There are three levels of categorization for each resource: Typology > Category > Characteristics

## Development

### Supabase
Update the supabase types:
```bash
pnpm run gen:supabase
```
Update migrations:
```bash
pnpm supabase db push
```

### Start the project
In VSCode, press F5 or click the Run button.

## Agents
For AI agents, see [AGENTS.md](AGENTS.md).