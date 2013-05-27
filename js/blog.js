/**
 * Copyright (c) 2013, Jérôme Prudent
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *   * Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *   * Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *   * Neither the name of the <organization> nor the
 *     names of its contributors may be used to endorse or promote products
 *     derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
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
//  root: true,       // flag for the root node
//  virtual: true,    // flag for virtual node. Virtual nodes have no content
//  childs : [],      // children nodes
//  parent : nodeP,   // parent node
//  level : 2         // how deep the node is in the tree. Starts at 0.
//  content : nodeHTML// content of the node. It's a DOM node.
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

var tree = createTree(2,4);


displayTree(tree,
            function(item){
              var i,spaces = "";
              
              if(item.virtual) return;
              
              for(i=0; i<item.level; i++){
                spaces = spaces + "*";
              }
              console.log(spaces + item.content.innerHTML);
            });



(function(){
  
  var context = {
        parentUl :document.getElementById("toc-js"),
        ul : document.createElement("ul")
      },
      
      visitElement = function(node){
        console.log(this,node.content);
        var li;
        if(!node.virtual){
          li = document.createElement("li");
          li.innerHTML = node.content.innerHTML;
          this.ul.appendChild(li);
        }
      },
      
      visitFirstChild = function(){
        var outer = this;
        this.parentUl.appendChild(this.ul);
        
        return {
          parentUl : outer.ul,
          ul : document.createElement("ul"),
        }
        
      },
  
      visitLastChild = function(){
        
      }
  
  displayTree(tree,visitElement,visitFirstChild, visitLastChild, context);
  
})();


