/*
 Copyright (C) 2012 Thomas Booth
 Copyright (C) 2012 Dejian Xu
 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:
 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

// modified version of https://www.npmjs.org/package/aho-corasick.js,
// 11/2014 hacked to match whole words only
// 11/2014 hacked to pass string index in callback

var AhoCorasick = { };

(function (AhoCorasick) {


    function TrieNode() {

        this.suffix = { };
        this.is_word = null;
        this.value = null;
        this.data = [ ];

    }

    TrieNode.prototype.add = function (word, data, original_word) {

        var chr = word.charAt(0),
            node = this.suffix[chr];

        if (!node) {
            node = this.suffix[chr] = new TrieNode();

            if (original_word) node.value = original_word.substr(0, original_word.length - word.length + 1);
            else node.value = chr;
        }

        if (word.length > 1) node.add(word.substring(1), data, original_word || word);
        else {
            node.data.push(data);
            node.is_word = true;
        }

    };

    TrieNode.prototype.find = function (word) {

        var suffix_node;

        if (word.length === 0 || this.is_word) return this;
        else {

            suffix_node = this.suffix[word.charAt(0)];

            return suffix_node ? suffix_node.find(word.substring(1)) : null;

        }

    };

    TrieNode.prototype.print = function (prefix) {

        var current = this,
            suffixes = Object.keys(this.suffix),
            out = this.value ? this.value : '(base)';

        if (this.is_word) out = '[' + out + ']';
        if (prefix) out = prefix + out;

        console.log(out);

        if (this.suffix_link) console.log(out + ' <- ' + this.suffix_link.value + ' [' + this.suffix_offset + ']');

        for (var i = 0, len = suffixes.length; i < len; i++) {
            this.suffix[suffixes[i]].print(out + ' -> ');
        }

    };

    AhoCorasick.TrieNode = TrieNode;

    AhoCorasick.add_suffix_links = function (node, trie) {

        var suffixes = Object.keys(node.suffix),
            link_node;

        trie = trie || node;

        node.suffix_link = null;
        node.suffix_offset = 0;

        if (node.value) {
            for (var i = 1, len = node.value.length; i < len && !link_node; i++) {
                link_node = trie.find(node.value.substring(i));
            }

            if (link_node) {
                node.suffix_link = link_node;
                node.suffix_offset = node.value.length - (node.value.lastIndexOf(link_node.value) + link_node.value.length);
            }
        }

        for (i = 0, len = suffixes.length; i < len; i++) {
            AhoCorasick.add_suffix_links(node.suffix[suffixes[i]], trie);
        }
    };

    function isNonWord(chr) {
        return " ,./<>?;'#:@~[]{}-=_+!\"£$%^&*()_+\\|".indexOf(chr) != -1;  //sucha hack
    }

    AhoCorasick.search = function (string, trie, callback) {

        var current = trie;

        for (var i = 0, len = string.length; i < len; i++) {
            var chr = string.charAt(i);
            var next = current.suffix[chr];

            if (next) {
                current = next;
            }
            else {
                if (callback && current && current.is_word) {
                    if ( isNonWord(chr) ) {
                        callback(current.value, i - current.value.length, current.data);
                    }
                }

                if (current.suffix_link) {
                    i = i - (current.suffix_offset + 1);
                    current = current.suffix_link;
                }
                else {
                    current = trie;
                }

            }

        }

        if (callback && current && current.is_word) {
            callback(current.value, i - current.value.length, current.data);
        }

    };


}(AhoCorasick));

if (module) module.exports = AhoCorasick;
else window.AhoCorasick = AhoCorasick;

