# F-List Drag & Drop
FL Drag & Drop as well as a few other utilities. Written in a mix of Inferno + VanillaJs.\
Drag and Drop K's to Custom K's to easy create subK's.  Right Click / Heart-Click to open an edit dialog.  Add and remove as needed.\
Hosted at: [SleazyFork](https://sleazyfork.org/en/scripts/409850-f-l-drag-drop-1-0) (which is pretty much [GreasyFork](https://greasyfork.org/en)) \
See info on how to use [SleazyFork](https://sleazyfork.org/en) at their main page.\
Or, you can copy and paste the published code in your browser.\
(In general, be careful with doing that.  A lot of social engineering attacks have been done from pasting unchecked code.  Feel free to inspect this source and distributed code as needed.  It only makes one web request to save SubFets, honestly.)\
(Also, I've attempted to stray from crude language as much as possible, at least in the pictures and informational sections.)

# Screenshots

Show UI:
![1](https://raw.githubusercontent.com/ZyLyXy/FLDragAndDrop/master/pics/showTable.png)
<sub>Click the "Show Table" button to open the main dialog.</sub>

Tables:
![2](https://raw.githubusercontent.com/ZyLyXy/FLDragAndDrop/master/pics/table.png)
<sub>All your information should be present here.</sub>\
<sub>Click on a K to select it. Clicking the heart-icon opens an editor to change the name/choice/description.  Clicking the -/+ closes/opens subK's.
Multiple can be selected by holding CTRL.  Ranges can be selected by holding SHIFT.  Only regular K's or custom K's can be multi-selected at a time.</sub>\
<sub>You can drag and drop K's to CK's and choice boxes.  Note that only saved CK's can have subK's. ((Could probably figure out a way to workaround it, but for now, it's unsupported.))</sub>\
<sub>At the top, click the -/+ to close/open all K's with subK's.</sub>\
<sub>Click the header/content/footer to wrap the K name is a matching format.  The select on the right is a list of invisible characters you can prefix the K name with (index: characterCode).  You can use it to sort the K's up and down, creating a hierarchy.  Selecting X removes the characters. (Note that headers get an extra invisible char, to move them above the content/footer.)</sub>\
<sub>Click + Custom K to add a new K, similar to the edit dialog.</sub>\
<sub>Click - Custom K to remove all currently selected K's.</sub>\
<sub>Click Apply Changes to apply changes to the page.  Note, that nothing is actually saved yet.  You need to Update Character once you're all set.</sub>

Selects:
![3](https://raw.githubusercontent.com/ZyLyXy/FLDragAndDrop/master/pics/subSelects.png)
<sub>Each K will gain a select box, to easily map the K to a CK. Select None or click X to remove it.</sub>
