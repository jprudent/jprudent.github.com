/**
* Use of genetoc to generate a table of contents.
* output is an imbrication of <ul>s and <li>s
*/
(function(){
  
  var id = 0,
      context = {
        parentUl :document.getElementById("toc-js"), // !! REQUIRE you have such an element in your page
        ul : document.createElement("ul")
      },
      
      visitElement = function(node){
        var li, link, toc_link, anchor;
        if(!node.virtual){

          //add an anchor on the element
          anchor = document.createElement("a");
          anchor.id = "genetoc-"+(id++);
          node.content.parentNode.insertBefore(anchor, node.content);

          // generate the toc line
          li = document.createElement("li");
          link = document.createElement("a");
          link.href = "#" + anchor.id;
          link.id = "toc-" + anchor.id;
          li.appendChild(link);
          link.innerHTML = node.content.innerHTML;
          this.ul.appendChild(li);
          
          // add a back link on the element to the toc line
          toc_link = document.createElement("a");
          toc_link.innerHTML = "toc";
          toc_link.classList.add("genetoc-toc-backlink");
          toc_link.href = "#" + link.id;
          node.content.appendChild(toc_link);

        }
      },
      
      visitFirstChild = function(){
        var outer = this,
            ul = document.createElement("ul");
            
        this.parentUl.appendChild(ul);
        
        return {
          parentUl : ul,
          ul : ul
        }
        
      },
  
      visitLastChild = function(){},
      
      //a tree starting at h2 ending at h3
      tree = createTree(2,5);
  
  displayTree(tree,visitElement,visitFirstChild, visitLastChild, context);
  
  console.log(document.getElementById("toc-js").innerHTML);
  
})();
