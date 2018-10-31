import InlineEditor from '@ckeditor/ckeditor5-build-inline';

const EDITABLE_SELECTOR = '.editable';
const COLLECTION = 'collection';
const SLUG = 'slug';

function getIdentifier(el) {
	var id = {};
	if(el && el.dataset) {
		id.collection = el.dataset[COLLECTION];
	  	id.slug = el.dataset[SLUG];
	}
  	return id;
}

// Save the data to a fake HTTP server (emulated here with a setTimeout()).
export function saveData( id, data ) {
    return new Promise( resolve => {
        setTimeout( () => {
            console.log( 'Saved ' + id, data );

            resolve();
        }, 1 );
    } );
}

export default class Editor {

	constructor() {
	  console.log("initEditor")
	  let editables = document.querySelectorAll( EDITABLE_SELECTOR );
	  for (var i = 0; i < editables.length; ++i) {

	  	let id = getIdentifier(editor.element);
	  	if(!id.collection || !id.slug) continue;

	    InlineEditor
	    .create( editables[i])
	    .then( editor => {
			(window.editors = window.editors || []).push(editor);

			editor.model.document.on( 'change:data', () => {
				console.log( 'The data has changed!' );
			} );

		  	editor.ui.focusTracker.on( 'change:isFocused', ( evt, name, isFocused ) => {
			    if ( !isFocused ) {
			    	console.log( 'Blur editor' );
			        // Do whatever you want with current editor data:
			        saveData( id, editor.getData() );
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