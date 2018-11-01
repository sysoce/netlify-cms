import InlineEditor from '@ckeditor/ckeditor5-build-inline';

const IDENTIFIER = 'identifier';
const SELECTOR = '[data-' + IDENTIFIER + ']';

function getIdentifier(el) {
	var id = {};
	if(el && el.dataset) {
		console.log(el.dataset[IDENTIFIER])
		id = JSON.parse(el.dataset[IDENTIFIER]);
	}
  	return id;
}

// Save the data to a fake HTTP server (emulated here with a setTimeout()).
export function saveData(backend, collections, id, data ) {
    return new Promise( resolve => {
        setTimeout( () => {
            console.log( 'Saved ' + id, data );
            const collection = collections.get(id.collection);
            console.log(collection)

            if (!id.slug) {
		      backend.createEmptyDraft(collection);
		    } else {
		      backend.loadEntry(collection, id.slug);
		    }
		    backend.changeDraftField(id.field, data, null);

            backend.persistEntry(collection);

            resolve();
        }, 1 );
    } );
}

export default class Editor {

	constructor(backend, collections) {
		this.backend = backend;
		this.collections = collections;

	  	console.log("initEditor")
	  	let elements = document.querySelectorAll( SELECTOR );
	  	for (var i = 0; i < elements.length; ++i) {

	  		let id = getIdentifier(elements[i]);
	  		console.log("identifier", id)
	  		if(!id.collection || !id.field) continue;

		    InlineEditor
		    .create( elements[i])
		    .then( editor => {
				(window.editors = window.editors || []).push(editor);

				editor.model.document.on( 'change:data', () => {
					console.log( 'The data has changed!' );
				} );

			  	editor.ui.focusTracker.on( 'change:isFocused', ( evt, name, isFocused ) => {
				    if ( !isFocused ) {
				    	console.log( 'Blur editor' );
				        // Do whatever you want with current editor data:
				        saveData(backend, collections, id, editor.getData() );
				    }
				});

		      	console.log( 'Editor was initialized', editor );

		    } )
		    .catch( err => {
		      console.error( err.stack );
		    } );
	  	}
	}
}