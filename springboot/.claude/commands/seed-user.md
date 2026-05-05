---
description: Create a single dummy user in the database
allowed-tools: Read, mvn spring-boot:run:*
---

Read backend/../com/spendly/repository/UserRepository.java to understand the users table schema.

Then run a DB script that:

1. Generates a realistic random Indian user using your 
   own knowledge of common Indian names across regions:
   - Name: a realistic Indian first + last name
   - Email: derived from the name with a random 2-3 digit 
     number suffix (e.g. rahul.sharma91@gmail.com)
   - Password: "password123" hashed with werkzeug's 
     generate_password_hash
   - created_at: current datetime

2. Checks if the generated email already exists in the 
   users table. If it does, regenerate until unique.

3. Inserts the user into the database.

4. Prints confirmation:
   - id
   - name
   - email
