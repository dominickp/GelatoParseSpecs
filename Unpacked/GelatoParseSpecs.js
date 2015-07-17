/*
                                   
,---.|                        |    
`---.|---.,---.. . .,-.-..   .|--- 
    ||   |,---|| | || | ||   ||    
`---'`   '`---^`-'-'` ' '`---'`---'
C o m m u n i c a t i o n s G r o u p

Author:	Shawmut Communications Group, Dominick G. Peluso
Date:		July 17, 2015

Copyright © 2015

Writes any values to private data.

-----------------------------------------------------------------------

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License along
with this program; if not, write to the Free Software Foundation, Inc.,
51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.

*/

function jobArrived( s : Switch, job : Job )
{
	// Declare variables
	var filenameProper = job.getNameProper();
	var debug = s.getPropertyValue( 'Debug' );
	
	var PdKeyPrintedMaterial = s.getPropertyValue( 'PdKeyPrintedMaterial' );
	var PdKeyProcess = s.getPropertyValue( 'PdKeyProcess' );
	var PdKeyDuplex = s.getPropertyValue( 'PdKeyDuplex' );
	var PdKeyDefaultMedia = s.getPropertyValue( 'PdKeyDefaultMedia' );
	var PdKeyPaper = s.getPropertyValue( 'PdKeyPaper' );
	
	// Get the values from the filename
	var regex = /(.*)_(.*)_(.*)_(.*)_(.*)_.*/;
	regex.search( filenameProper );
	
	var plateId = regex.cap(1);
	var paperType = regex.cap(2);
	var productFormatFinishing = regex.cap(3);
	var separations = regex.cap(4);
	
	// Debug out
	if( debug == 'Yes' ) {
		s.log( 2, 'Debugging enabled.' );	
		s.log( 1, 'plateId: ' + plateId );	
		s.log( 1, 'paperType: '+ paperType );	
		s.log( 1, 'productFormatFinishing: '+ productFormatFinishing );	
		s.log( 1, 'separations: ' + separations );	
	}
	
	// Split the printed material and finishing operations
	var processCode = null;
	var printedMaterialCode = productFormatFinishing;
		
	if( productFormatFinishing.indexOf("-") > -1 ){
		var regex = /(.*)-(.*)/;
		regex.search( productFormatFinishing );
		printedMaterialCode = regex.cap(1);
		processCode = regex.cap(2);
	}
	
	// Split the separations
	var regex = /(.*)-(.*)/;
	regex.search( separations );
	var frontSide = regex.cap(1);
	var backSide = regex.cap(2);
	
	// Make an object containing printed material translations
	var printedMaterial = 
	{
		description: "Printed materials",
		XL:		"Ledger/Tabloid", 
		LT:		"Ledger folded", 
		LG:		"Large",
		LGL:	"Large Long",
		SM:		"Small",
		BX:		"BC",
		SX:		"SQ",
		SXD:	"SQD",
		'B5':	"B5 folded to 5R",
		'5R': 	"5R"
	};	
	
	// Make an object containing process translations
	var process = 
	{
		description: "Processes",
		fd:		"Folded", 
		ct:		"Cut", 
		fdct:	"Fold & Cut",
		cal:	"Calendar"
	};

	// Make an object containing paper translations
	var paper = 
	{
		description: "Paper",
		'130#C': 
		{
			id: "GELATO130#SILK",
			description: "130# Chorus Art Silk Digital Cover"
		},
		'170g':
		{
			id: "GELATO100#SILKCVR", 
			description: "100# Chorus Art Silk Digital Cover"
		},
		'130#U':
		{
			id: "GELATO120#UNCOATEDACOCVR", 
			description: "120# Accent Opaque Smooth Digital Cover"
		},
		'100#T':
		{
			id: "GElATO100#UNCOATEDCVR",
			description: "100# Accent Opaque Smooth Digital Cover"
		},
		'90g':	
		{
			id: "HP Indigo 60# Text Uncoated",
			description: "60# Accent Opaque Super Smooth Digital Text"
		}
	};

	// Attempt translations
	var translate = function( code, codex )
	{		
		// Check if exists
		if( code in codex ){
			translation = codex[code];
		} else {
			translation = 'no_translation_available';
			s.log(2, "Codex for " + codex.description + " could not find a translation for code '" + code + "'.")
		}		
		return translation;
	};
	
	var printedMaterialTrans 	= 	translate( printedMaterialCode, printedMaterial );
	var processTrans			 	= 	translate( processCode, process );
	var defaultMediaTrans		= 	translate( paperType, paper ).id;
	var paperTrans				= 	translate( paperType, paper ).description;
	
	// Determine duplexing
	if( backSide == '0' ){
		duplex = 'No';
	} else {
		duplex = 'Yes';
	}
			
	// Debug out
	if( debug == 'Yes' ) {
		s.log( 1, 'duplexing: ' + duplex );	
		s.log( 1, 'printedMaterialCode: ' + printedMaterialCode );
		s.log( 1, 'printedMaterialTrans: ' + printedMaterialTrans );
		s.log( 1, 'processCode: ' + processCode );
		s.log( 1, 'processTrans: ' + processTrans );
		s.log( 1, 'defaultMediaTrans: ' + defaultMediaTrans );
		s.log( 1, 'paperTrans: ' + paperTrans );
	};
	
	// Write to private data
	job.setPrivateData( PdKeyPrintedMaterial, printedMaterialTrans );
	job.setPrivateData( PdKeyProcess, processTrans );
	job.setPrivateData( PdKeyDuplex, duplex );
	job.setPrivateData( PdKeyDefaultMedia, defaultMediaTrans );
	job.setPrivateData( PdKeyPaper, paperTrans );
	
	// Finish
	job.sendToSingle( job.getPath() );
	
}
