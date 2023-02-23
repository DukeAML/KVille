
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';



export function changeAvailability(){
    firebase
    .firestore()
    .collection('groups')
    .doc("uAxv9a3I").collection('members')
    .get()
        .then((querySnapshot) => {
        querySnapshot.forEach(async (doc) => {
            let newAvailability = doc.data().availability;

            console.log(newAvailability);
            for (let i=0; i<newAvailability.length; i++){
                if (i<38 || i>=254){
                    newAvailability[i] = false;
                }
            }

            await doc.ref.update({
                availability: newAvailability,
            });

        });
    })
}
    



