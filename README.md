# Label Structure

> Legend:  
\[\*\] = required field  
\[T1\] = Type 1 category. Fixed number of possible labels under this category, and each picture should strictly have =1 label.  
\[T2\] = Type 2 category. Allow customized labels under this category during upload, and each picture can accept a list of labels.  
\[T3\] = Type 3 category. Human figure.

- Location:
	- In/outdoor \[T1\*\] (indoor, outdoor)
	- Purpose of the place \[T2\*\] (eg. library, hospital)
  - Architecture component \[T2\] (eg. escalator, hallway)
- Spectators:
	- Quantity \[T1\*\] (none, small, large)
	- Density \[T1\*\] (none, sparse, dense)
	- Attentive \[T1\*\] (1,2,3,4,5,6,7,8,>8)
- Modality \[T3\*\]:  
	Body part - State  
	- Body parts (head, eyes, voice, facial expression, right arm, left arm, right hand, left hand, legs, feet)
	- States (available, unavailable)
- Demographic:
	- Age \[T1\] (baby, child, teen, young adult, adult, senior)
	- Biological sex \[T1\] (F/M)
	- Social role \[T2\] (eg. student, teacher, customer, parent)
- Posture \[T2\*\] (eg. sitting, pointing)

> May also refer to labels_data.js


---


# Codebase Structure

![codebase structure diagram](./readme_imgs/CodebaseStructure.png?raw=true)


---


# Firebase Storage Structure

## Realtime database:

### "images"
> "image" folder contains all data on the images that are uploaded to firebase storage.
- image id (for each image in the storage)
	- "index": image id
	- category (for each of the 5 categories)
		- subcategory (for each subcategory under the current category. Ignore this layer if no subcategory exists under a certain category)
			- label (all labels that the current image has under the current subcategory)
	- "timestamp": timestamp
	- "url": image url

### "labels"
> "labels" folder contains the mapping from each label to the images that are associated with that label.
- category (for each of the 5 categories)
	- subcategory (for each subcategory under the current category. Ignore this layer if no subcategory exists under a certain category)
		- label (for each existing label under the current subcategory)
			- image id (for each image with the current label)
				- "url": image url

### "reviewed_labels"
> "reviewed_labels" folder contains the standard type2 labels to use in the picture-annotation form (AnnotationForm). Note that type1 and type3 labels are not stored here.
- category (for each category that is type2 or contains type2 subcategories)
	- subcategory (for each type 2 subcategory. Ignore this layer if no subcategory exists under a certain category)
		- label (for each reviewed type2 label)
			- "display": label display text

### "unreviewed_labels"
> "unreviewed_labels" folder contains all unreviewed type2 labels, organized by categories, to wait for maunal reviewing. \[TODO: After manual reviewing and deciding on validity of a label, automate the process of moving the valid labels into "reviewed_labels" folder and remove(?) the invalid ones. Also remove invalid labels from the right places under "images" and "labels".\]
- category (for each category that is type2 or contains type2 subcategories)
	- subcategory (for each type 2 subcategory. Ignore this layer if no subcategory exists under a certain category)
		- label (for each unreviewed label)
			- "count": number of time the label has been mentioned

### "users"
> "users" folder records all user names and passwords. \[TODO: Add this folder to help login.\]
- username (for each user in the system)
	- "pwd": password

## Storage:
All pictures are stored under an "images" folder.


---


# Resources on React Usage

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)



# Resources on Firebase Deploy

TODO
