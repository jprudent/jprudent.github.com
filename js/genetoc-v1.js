/**
* - Author : jprudent@gmail.com
* - Licence: BSD
*
* Main features:
* - No dependencies
* - Support gaps in markups(eg: <h2> then <h4> without <h3> before)
*
*/

//@param startLevel level of the roots
//@param endLevel how deep the leaves will be
//
//@return a tree structure where nodes are like :
//{
// root: true, // flag for the root node
// virtual: true, // flag for virtual node. Virtual nodes have no content
// childs : [], // children nodes
// parent : nodeP, // parent node
// level : 2 // how deep the node is in the tree. Starts at 0.
// content : nodeHTML// content of the node. It's a DOM node.
//}
function createTree(startLevel, endLevel){
  
  var //the root of the tree
      toc = {root: true, virtual: true, childs : [],
             last : function(){
                      function iterate(item){
                        if(item.childs.length == 0){
                          return item;
                        }
                        else {
                          return iterate(item.childs[item.childs.length - 1]);
                        }
                      }
                      return iterate(toc);
            }},
      i,
      //contains the CSS query selector for all <h?>s
      cssQuery = "",
      //function that append an h to a tree
      appendItem = function(h, toc){
        var h,
            hItem,
            lastLevel,
            
            createItem = function(h){
              return {
                content : h,
                childs : [],
                level : h.tagName.match(/h|H(\d)/)[1] - startLevel, //TODO as variable
                parent: toc, //default is root
                addMeToParent : function(){ this.parent.childs.push(this); }
              }
            },
            
            doWithLast = function(fn,d){
              var last = toc.last();
              if (last.root){
                return d; //there is at least root node
              }
              else {
                fn.call(this, last);
              }
            };
        
        hItem = createItem(h)
        
        
        doWithLast(function(last){
          var diff,
              back = function(item,times){
                if(times == 0){
                  return item;
                } else {
                  return back(item.parent, times - 1);
                }
              },
              createVirtualNodes = function(item,nb){
                var virtualNode;
                if(nb == -1){
                  return item
                } else {
                  virtualNode = {
                    virtual: true,
                    level: item.level + 1,
                    parent: item,
                    childs: [], //TODO children
                    addMeToParent : item.addMeToParent
                  };
                  virtualNode.addMeToParent();
                  return createVirtualNodes(virtualNode, nb+1);
                }
              };
          
          diff = last.level - hItem.level
          if(diff >= 0){
            hItem.parent = back(last,diff).parent;
          } else if(diff < 0){
            hItem.parent = createVirtualNodes(last, diff);
          }
          return hItem;
        });
        
        hItem.addMeToParent();
        
    };
  
  //get all <h?/> elements
  //TODO as variable
  for(i=startLevel;i<endLevel;i++){
    cssQuery = cssQuery + "h"+i+",";
  }
  cssQuery = cssQuery + "h" + i;
  
  hs = document.querySelectorAll(cssQuery);
  
  for(i=0;i<hs.length;i++){
    appendItem(hs.item(i),toc);
  }
    
  return toc;
}

// @param tree The tree to display
// @param visitElement a function that takes current node of the tree as parameter.
// is executed under `context`
// @param visitFirstChild a function that is executed before processing any child of current node
// is executed under `context`
// must return a new context that is passed to children
// @param visitLastChild a function that is exectuted after processing of all children
// is executed under `context`
// @param context a context object for methods execution
function displayTree(tree, visitElement, visitFirstChild, visitLastChild, context){
  var i, newContext;

  visitElement && visitElement.call(context,tree);
  
  if(tree.childs.length >= 1){
    newContext = visitFirstChild && visitFirstChild.call(context);
    for(i=0; i<tree.childs.length; i++){
      displayTree(tree.childs[i], visitElement, visitFirstChild, visitLastChild, newContext);
    }
    visitLastChild && visitLastChild.call(context);
  }
}
