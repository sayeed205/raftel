import { useState } from 'react';
import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input.tsx';

export default function SearchSettings() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className='relative'>
      <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
      <Input
        placeholder='Search settings...'
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setShowSearch(e.target.value.length > 0);
        }}
        className='pl-9'
      />
      {showSearch && searchQuery && (
        <></>
        // <SettingsSearch
        //   query={searchQuery}
        //   results={searchResults}
        //   onSelect={handleSearchResultSelect}
        //   onClose={() => setShowSearch(false)}
        // />
      )}
    </div>
  );
}
