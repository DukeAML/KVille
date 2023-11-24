import {firestore} from "./firebase_config.js";
// Reference to the groups collection

const groupsCollection = firestore.collection('groups');

const groupsSnapshot = await groupsCollection.get();

    // Iterate over each group
    for (const groupDoc of groupsSnapshot.docs) {
        console.log("working with group " + groupDoc.id);
      // Reference to the members collection of the current group
      const membersCollection = groupDoc.ref.collection('members');

      // Get all members of the current group
      const membersSnapshot = await membersCollection.get();

      // Iterate over each member
      for (const memberDoc of membersSnapshot.docs) {

        console.log("working with member" + memberDoc.id);
        // Read existing data from the member document
        const existingData = await memberDoc.data();
        let newAvailability = existingData.availability.map((a) => {return {available : a.available.available, preferred : false}});

        // Add the computed value as a new field to the member document
        await memberDoc.ref.set({
          availability : newAvailability,
          availabilityStartDate : existingData.availabilityStartDate
        });
        
      }
    }